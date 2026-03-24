import { create } from 'zustand';
import { api } from '../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SyncState {
  isSyncing: boolean;
  lastSyncedAt: string | null;
  syncError: string | null;
  performIncrementalSync: (userId: string) => Promise<void>;
  performFullSync: (userId: string) => Promise<void>;
  clearSyncError: () => void;
  setLastSynced: (date: string) => void;
}

export const useSyncStore = create<SyncState>((set, get) => ({
  isSyncing: false,
  lastSyncedAt: null,
  syncError: null,

  clearSyncError: () => set({ syncError: null }),

  setLastSynced: (date: string) => {
    set({ lastSyncedAt: date });
    AsyncStorage.setItem('lastSyncedAt', date).catch(() => {});
  },

  performIncrementalSync: async (userId: string) => {
    const token = await api.getToken();
    if (!token) return;

    const { lastSyncedAt } = get();
    set({ isSyncing: true, syncError: null });

    try {
      if (lastSyncedAt) {
        const data = await api.sync.incremental(userId, lastSyncedAt);
        set({ isSyncing: false, lastSyncedAt: data.syncedAt });
      } else {
        const data = await api.sync.fetch(userId);
        set({ isSyncing: false, lastSyncedAt: data.syncedAt });
      }
    } catch (err) {
      set({
        isSyncing: false,
        syncError: err instanceof Error ? err.message : 'Sync failed',
      });
    }
  },

  performFullSync: async (userId: string) => {
    const token = await api.getToken();
    if (!token) return;

    set({ isSyncing: true, syncError: null });

    try {
      const data = await api.sync.fetch(userId);
      set({ isSyncing: false, lastSyncedAt: data.syncedAt });
    } catch (err) {
      set({
        isSyncing: false,
        syncError: err instanceof Error ? err.message : 'Full sync failed',
      });
    }
  },
}));

// Initialize lastSyncedAt from AsyncStorage
AsyncStorage.getItem('lastSyncedAt').then(date => {
  if (date) {
    useSyncStore.getState().setLastSynced(date);
  }
});
