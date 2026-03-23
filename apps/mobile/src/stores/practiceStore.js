import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { INIT_PRACTICES, uid } from '@ananta/utils';
export const usePracticeStore = create()(persist((set, get) => ({
    practices: [],
    addPractice: (practice) => set((state) => ({
        practices: [...state.practices, { ...practice, id: uid() }],
    })),
    updatePractice: (id, updates) => set((state) => ({
        practices: state.practices.map((p) => p.id === id ? { ...p, ...updates } : p),
    })),
    deletePractice: (id) => set((state) => ({
        practices: state.practices.filter((p) => p.id !== id),
    })),
    getPractice: (id) => get().practices.find((p) => p.id === id),
    seedIfEmpty: () => {
        if (get().practices.length === 0) {
            set({ practices: INIT_PRACTICES });
        }
    },
}), {
    name: 'practice-storage',
    storage: createJSONStorage(() => AsyncStorage),
}));
