import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface SimulationAlertState {
  hasSeenSimulationAlert: boolean;
  acknowledgeSimulationAlert: () => void;
  reset: () => void;
}

export const useSimulationAlertStore = create<SimulationAlertState>()(
  persist(
    (set) => ({
      hasSeenSimulationAlert: false,

      acknowledgeSimulationAlert: () => set({ hasSeenSimulationAlert: true }),

      reset: () => set({ hasSeenSimulationAlert: false }),
    }),
    {
      name: "simulation-alert-storage",
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);
