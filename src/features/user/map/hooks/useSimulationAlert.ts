import { useCallback } from "react";
import { isSimulatingEnable } from "@/src/constants/user/map/simulation";
import { useSimulationAlertStore } from "@/src/stores/user/map/simulationAlertStore";

export function useSimulationAlert() {
  const hasSeenSimulationAlert = useSimulationAlertStore((state) => state.hasSeenSimulationAlert);
  const acknowledge = useSimulationAlertStore((state) => state.acknowledgeSimulationAlert);

  const shouldShowSimulationAlert = isSimulatingEnable && !hasSeenSimulationAlert;

  const acknowledgeSimulationAlert = useCallback(() => {
    acknowledge();
  }, [acknowledge]);

  return { shouldShowSimulationAlert, acknowledgeSimulationAlert };
}
