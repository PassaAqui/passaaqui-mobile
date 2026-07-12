import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface VisitedCitiesState {
  visitedCityIds: number[];
  markCityAsVisited: (cityId: number) => void;
  hasVisitedCity: (cityId: number) => boolean;
  reset: () => void;
}

export const useVisitedCitiesStore = create<VisitedCitiesState>()(
  persist(
    (set, get) => ({
      visitedCityIds: [],

      markCityAsVisited: (cityId) => {
        if (get().visitedCityIds.includes(cityId)) return;
        set((state) => ({ visitedCityIds: [...state.visitedCityIds, cityId] }));
      },

      hasVisitedCity: (cityId) => get().visitedCityIds.includes(cityId),

      reset: () => set({ visitedCityIds: [] }),
    }),
    {
      name: "visited-cities-storage",
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);