import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { uid } from '@ananta/utils';
export const useRecordStore = create()(persist((set, get) => ({
    records: [],
    addRecord: (record) => set((state) => ({
        records: [...state.records, { ...record, id: uid() }],
    })),
    getRecordsByPractice: (practiceId) => get().records.filter((r) => r.practiceId === practiceId),
    getRecordsByCampaign: (campaignId) => get().records.filter((r) => r.campaignId === campaignId),
    getRecordsInRange: (start, end) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        return get().records.filter((r) => {
            const recordDate = new Date(r.recordedAt);
            return recordDate >= startDate && recordDate <= endDate;
        });
    },
    deleteRecord: (id) => set((state) => ({
        records: state.records.filter((r) => r.id !== id),
    })),
}), {
    name: 'record-storage',
    storage: createJSONStorage(() => AsyncStorage),
}));
