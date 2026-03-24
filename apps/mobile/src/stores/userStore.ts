import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserProfile } from '@ananta/types';
import { uid } from '@ananta/utils';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

interface UserState {
  user: UserProfile;
  anonymousId: string;
  token: string | null;
  onboardingComplete: boolean;
  updateUser: (updates: Partial<UserProfile>) => void;
  setOnboardingComplete: (complete: boolean) => void;
  initAnonymousUser: () => void;
  checkAuth: () => Promise<void>;
}

const defaultUser: UserProfile = {
  id: '',
  name: '普贤居士',
  avatar: '普',
  bio: '',
  dataPublic: true,
  inRanking: true,
  allowFriendReq: true,
  fontScale: 1.0,
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: { ...defaultUser, id: '' },
      anonymousId: '',
      token: null,
      onboardingComplete: false,
      updateUser: (updates) =>
        set((state) => ({
          user: { ...state.user, ...updates },
        })),
      setOnboardingComplete: (complete) =>
        set({ onboardingComplete: complete }),
      initAnonymousUser: () => {
        const existingId = get().anonymousId;
        if (!existingId) {
          const newId = uid();
          set({
            anonymousId: newId,
            user: { ...get().user, id: newId },
          });
        }
      },
      checkAuth: async () => {
        const { anonymousId, token } = get();
        const id = anonymousId || uid();
        try {
          const res = await fetch(`${API_BASE}/auth/check`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ anonymousId: id, token }),
          });
          if (res.ok) {
            const data = await res.json();
            set({
              user: { ...data.user, fontScale: data.user.fontScale ?? 1.0 },
              anonymousId: data.user.id,
              token: data.token,
            });
          } else {
            // Ensure anonymousId exists even on network failure
            if (!get().anonymousId) {
              set({ anonymousId: id, user: { ...get().user, id } });
            }
          }
        } catch {
          // Network error — keep local state
          if (!get().anonymousId) {
            set({ anonymousId: id, user: { ...get().user, id } });
          }
        }
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
