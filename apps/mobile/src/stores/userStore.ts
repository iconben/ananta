import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserProfile } from '@ananta/types';
import { uid } from '@ananta/utils';

interface UserState {
  user: UserProfile;
  anonymousId: string;
  onboardingComplete: boolean;
  updateUser: (updates: Partial<UserProfile>) => void;
  setOnboardingComplete: (complete: boolean) => void;
  initAnonymousUser: () => void;
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
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
