import { create } from 'zustand';
import { api, ApiError } from '../api/client';
import { storage, AUTH_TOKEN_KEY, AUTH_EMAIL_KEY, REFRESH_TOKEN_KEY } from '../storage';
import type { UserProfile } from '@ananta/types';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;

  /** Initialize auth state from persisted storage */
  init: () => Promise<void>;

  /** Email + password login */
  login: (email: string, password: string) => Promise<void>;

  /** Register new account */
  register: (email: string, password: string, name?: string, avatar?: string) => Promise<void>;

  /** Request magic link email */
  requestMagicLink: (email: string) => Promise<void>;

  /** Reset password with magic link token */
  resetPassword: (token: string, newPassword: string) => Promise<void>;

  /** Sign out and clear persisted session */
  logout: () => Promise<void>;

  /** Clear any error state */
  clearError: () => void;

  /** Refresh access token */
  refreshAccessToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  token: null,
  refreshToken: null,
  user: null,
  isLoading: false,
  error: null,

  init: async () => {
    set({ isLoading: true });
    try {
      const token = await storage.get<string>(AUTH_TOKEN_KEY);
      const refreshToken = await storage.get<string>(REFRESH_TOKEN_KEY);
      if (token) {
        set({ token, refreshToken });
        // Fetch user profile
        try {
          const user = await api.user.me();
          set({ user: user as UserProfile });
        } catch {
          // Token may be expired
        }
      }
    } catch {
      await api.clearTokens();
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.auth.login({ email, password });
      await api.saveTokens(res.accessToken, res.refreshToken);
      await api.saveEmail(email);
      set({
        token: res.accessToken,
        refreshToken: res.refreshToken,
        isLoading: false,
      });
      // Fetch user profile
      try {
        const user = await api.user.me();
        set({ user: user as UserProfile });
      } catch {}
    } catch (err) {
      const message = err instanceof ApiError ? err.message : '登录失败，请检查邮箱和密码';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  register: async (email, password, name, avatar) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.auth.register({ email, password, name, avatar });
      await api.saveTokens(res.accessToken, res.refreshToken);
      await api.saveEmail(email);
      set({
        token: res.accessToken,
        refreshToken: res.refreshToken,
        isLoading: false,
      });
      // Fetch user profile
      try {
        const user = await api.user.me();
        set({ user: user as UserProfile });
      } catch {}
    } catch (err) {
      const message = err instanceof ApiError ? err.message : '注册失败，请稍后重试';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  requestMagicLink: async (email) => {
    set({ isLoading: true, error: null });
    try {
      await api.auth.requestMagicLink(email);
      await api.saveEmail(email);
      set({ isLoading: false });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : '发送失败，请稍后重试';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  resetPassword: async (token, newPassword) => {
    set({ isLoading: true, error: null });
    try {
      await api.auth.resetPassword(token, newPassword);
      set({ isLoading: false });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : '重置失败，链接可能已过期';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    await api.clearTokens();
    set({ token: null, refreshToken: null, user: null, error: null });
  },

  clearError: () => set({ error: null }),

  refreshAccessToken: async () => {
    const refreshToken = get().refreshToken;
    if (!refreshToken) {
      throw new Error('No refresh token');
    }
    try {
      const res = await api.auth.refresh(refreshToken);
      await api.saveToken(res.accessToken);
      set({ token: res.accessToken });
    } catch {
      await api.clearTokens();
      set({ token: null, refreshToken: null, user: null });
      throw new Error('Session expired');
    }
  },
}));
