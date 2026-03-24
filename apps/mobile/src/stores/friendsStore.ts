import { create } from 'zustand';
import { api, Friend, FriendRequest, FeedItem, LeaderboardEntry } from '../api/client';

interface FriendsState {
  friends: Friend[];
  requests: FriendRequest[];
  feed: FeedItem[];
  leaderboard: LeaderboardEntry[];
  isLoading: boolean;
  error: string | null;

  fetchFriends: () => Promise<void>;
  fetchRequests: () => Promise<void>;
  fetchFeed: (userId: string) => Promise<void>;
  fetchLeaderboard: (practiceId?: string) => Promise<void>;
  sendRequest: (requesterId: string, inviteCode: string) => Promise<void>;
  acceptRequest: (friendshipId: string) => Promise<void>;
  rejectRequest: (friendshipId: string) => Promise<void>;
  removeFriend: (friendshipId: string) => Promise<void>;
  clearError: () => void;
}

export const useFriendsStore = create<FriendsState>((set) => ({
  friends: [],
  requests: [],
  feed: [],
  leaderboard: [],
  isLoading: false,
  error: null,

  fetchFriends: async () => {
    set({ isLoading: true, error: null });
    try {
      const friends = await api.friends.list();
      set({ friends, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: err instanceof Error ? err.message : 'Failed to fetch friends' });
    }
  },

  fetchRequests: async () => {
    try {
      const requests = await api.friends.requests();
      set({ requests });
    } catch {
      // Silently fail for requests
    }
  },

  fetchFeed: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const feed = await api.friends.feed(userId);
      set({ feed, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: err instanceof Error ? err.message : 'Failed to fetch feed' });
    }
  },

  fetchLeaderboard: async (practiceId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const leaderboard = await api.friends.leaderboard(20, practiceId);
      set({ leaderboard, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: err instanceof Error ? err.message : 'Failed to fetch leaderboard' });
    }
  },

  sendRequest: async (requesterId: string, inviteCode: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.friends.requestByCode(requesterId, inviteCode);
      set({ isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: err instanceof Error ? err.message : 'Failed to send request' });
      throw err;
    }
  },

  acceptRequest: async (friendshipId: string) => {
    try {
      await api.friends.accept(friendshipId);
      await useFriendsStore.getState().fetchRequests();
      await useFriendsStore.getState().fetchFriends();
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to accept request' });
    }
  },

  rejectRequest: async (friendshipId: string) => {
    try {
      await api.friends.reject(friendshipId);
      await useFriendsStore.getState().fetchRequests();
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to reject request' });
    }
  },

  removeFriend: async (friendshipId: string) => {
    try {
      await api.friends.remove(friendshipId);
      await useFriendsStore.getState().fetchFriends();
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to remove friend' });
    }
  },

  clearError: () => set({ error: null }),
}));
