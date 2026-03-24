import { storage, AUTH_TOKEN_KEY, AUTH_EMAIL_KEY, REFRESH_TOKEN_KEY } from '../storage';

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

async function request<T>(
  path: string,
  options: RequestInit = {},
  auth = true
): Promise<T> {
  const token = auth ? await storage.get<string>(AUTH_TOKEN_KEY) : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, (body as any).error ?? res.statusText);
  }

  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}

// ─── Auth ──────────────────────────────────────────────────────────────────

export interface LoginBody {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  userId: string;
}

export interface UserProfile {
  id: string;
  email?: string;
  name: string;
  avatar: string;
  bio?: string;
  dataPublic: boolean;
  inRanking: boolean;
  allowFriendReq: boolean;
  fontScale: number;
  inviteCode?: string;
}

export interface Friend {
  id: string;
  name: string;
  avatar: string;
  bio?: string;
  since?: string;
}

export interface FriendRequest {
  id: string;
  fromUser: {
    id: string;
    name: string;
    avatar: string;
    bio?: string;
  };
  createdAt: string;
}

export interface FeedItem {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  practiceId: string;
  practiceName: string;
  practiceIcon: string;
  count: number;
  note?: string;
  recordedAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  userAvatar: string;
  total: number;
}

export interface SyncData {
  user?: UserProfile;
  practices: any[];
  campaigns: any[];
  records: any[];
  syncedAt: string;
}

export const api = {
  auth: {
    /** Email + password login */
    login: (body: LoginBody) =>
      request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(body) }, false),

    /** Register a new account */
    register: (body: LoginBody & { name?: string; avatar?: string }) =>
      request<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(body) }, false),

    /** Exchange refresh token for new access token */
    refresh: (refreshToken: string) =>
      request<{ accessToken: string }>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      }, false),

    /** Request a magic link email */
    requestMagicLink: (email: string) =>
      request<{ success: boolean }>('/auth/magic-link', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }, false),

    /** Reset password with magic link token */
    resetPassword: (token: string, newPassword: string) =>
      request<{ success: boolean }>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
      }, false),

    /** Sign out */
    logout: () =>
      request<{ success: boolean }>('/auth/logout', { method: 'POST' }),
  },

  // ─── User ────────────────────────────────────────────────────────────────

  user: {
    /** Fetch current user profile */
    me: () => request<any>('/users/me'),

    /** Update current user profile */
    update: (updates: Record<string, unknown>) =>
      request<{ success: boolean }>('/users/me', {
        method: 'PUT',
        body: JSON.stringify(updates),
      }),

    /** Get user's invite code */
    getInviteCode: () =>
      request<{ inviteCode: string }>('/users/invite-code'),

    /** Lookup user by invite code */
    getUserByInviteCode: (code: string) =>
      request<{ id: string; name: string; avatar: string }>(`/users/by-invite-code/${code}`, {}, false),
  },

  // ─── Friends ─────────────────────────────────────────────────────────────

  friends: {
    /** List accepted friends */
    list: () => request<Friend[]>('/friends'),

    /** List pending incoming friend requests */
    requests: () => request<FriendRequest[]>('/friends/requests'),

    /** Send a friend request */
    request: (requesterId: string, addresseeId: string) =>
      request<{ id: string; status: string }>('/friends', {
        method: 'POST',
        body: JSON.stringify({ requesterId, addresseeId }),
      }),

    /** Send friend request by invite code */
    requestByCode: (requesterId: string, inviteCode: string) =>
      request<{ id: string; status: string }>('/friends/request', {
        method: 'POST',
        body: JSON.stringify({ requesterId, inviteCode }),
      }),

    /** Accept a friend request */
    accept: (friendshipId: string) =>
      request<{ success: boolean }>(`/friends/${friendshipId}/accept`, { method: 'PUT' }),

    /** Reject a friend request */
    reject: (friendshipId: string) =>
      request<{ success: boolean }>(`/friends/${friendshipId}/reject`, { method: 'PUT' }),

    /** Remove a friend */
    remove: (friendshipId: string) =>
      request<{ success: boolean }>(`/friends/${friendshipId}`, { method: 'DELETE' }),

    /** Get friend activity feed */
    feed: (userId: string, limit = 20) =>
      request<FeedItem[]>(`/friends/feed?userId=${userId}&limit=${limit}`),

    /** Get leaderboard */
    leaderboard: (limit = 20, practiceId?: string) => {
      const url = `/friends/leaderboard?limit=${limit}${practiceId ? `&practiceId=${practiceId}` : ''}`;
      return request<LeaderboardEntry[]>(url);
    },
  },

  // ─── Sync ────────────────────────────────────────────────────────────────

  sync: {
    /** Fetch all user data for initial sync */
    fetch: (userId: string) =>
      request<SyncData>(`/sync/fetch/${userId}`),

    /** Full sync - upload all data */
    full: (data: { user?: any; practices: any[]; campaigns: any[]; records: any[] }) =>
      request<{ success: boolean; syncedAt: string }>('/sync/sync', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    /** Incremental sync */
    incremental: (userId: string, since: string) =>
      request<SyncData>(`/sync/fetch/${userId}/incremental?lastSyncedAt=${since}`),
  },

  // ─── Token helpers ──────────────────────────────────────────────────────

  async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    await storage.set(AUTH_TOKEN_KEY, accessToken);
    await storage.set(REFRESH_TOKEN_KEY, refreshToken);
  },

  async saveToken(token: string): Promise<void> {
    await storage.set(AUTH_TOKEN_KEY, token);
  },

  async getToken(): Promise<string | null> {
    return storage.get<string>(AUTH_TOKEN_KEY);
  },

  async getRefreshToken(): Promise<string | null> {
    return storage.get<string>(REFRESH_TOKEN_KEY);
  },

  async clearTokens(): Promise<void> {
    await storage.remove(AUTH_TOKEN_KEY);
    await storage.remove(REFRESH_TOKEN_KEY);
    await storage.remove(AUTH_EMAIL_KEY);
  },

  async saveEmail(email: string): Promise<void> {
    await storage.set(AUTH_EMAIL_KEY, email);
  },

  async getEmail(): Promise<string | null> {
    return storage.get<string>(AUTH_EMAIL_KEY);
  },
};
