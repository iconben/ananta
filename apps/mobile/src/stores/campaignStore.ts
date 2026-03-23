import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Campaign } from '@ananta/types';
import { uid } from '@ananta/utils';

interface CampaignState {
  campaigns: Campaign[];
  addCampaign: (campaign: Omit<Campaign, 'id'>) => void;
  updateCampaign: (id: string, updates: Partial<Campaign>) => void;
  deleteCampaign: (id: string) => void;
  getCampaign: (id: string) => Campaign | undefined;
  getCampaignsByPractice: (practiceId: string) => Campaign[];
  getActiveCampaigns: () => Campaign[];
}

export const useCampaignStore = create<CampaignState>()(
  persist(
    (set, get) => ({
      campaigns: [],
      addCampaign: (campaign) =>
        set((state) => ({
          campaigns: [...state.campaigns, { ...campaign, id: uid() }],
        })),
      updateCampaign: (id, updates) =>
        set((state) => ({
          campaigns: state.campaigns.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),
      deleteCampaign: (id) =>
        set((state) => ({
          campaigns: state.campaigns.filter((c) => c.id !== id),
        })),
      getCampaign: (id) => get().campaigns.find((c) => c.id === id),
      getCampaignsByPractice: (practiceId) =>
        get().campaigns.filter((c) => c.practiceId === practiceId),
      getActiveCampaigns: () =>
        get().campaigns.filter((c) => !c.done && new Date(c.end) >= new Date()),
    }),
    {
      name: 'campaign-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
