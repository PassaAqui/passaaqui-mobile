import { useRef, useState } from "react";
import { updateRouteLocation, calculateAccumulatedDistance } from "@/src/services/routeService";

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface UseDebugRouteSimulationParams {
  routeCoords: Coordinate[];
  onSimulationEnd?: (simulatedDistanceKm: number) => void;
}

export function useDebugRouteSimulation({ routeCoords, onSimulationEnd }: UseDebugRouteSimulationParams) {
  const [simulating, setSimulating] = useState(false);
  const [currentSimPosition, setCurrentSimPosition] = useState<Coordinate | null>(null);
  const [simulatedDistanceKm, setSimulatedDistanceKm] = useState<number | null>(null);
  const indexRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function startSimulation() {
    if (!routeCoords.length) return;
    indexRef.current = 0;
    setSimulating(true);
    setSimulatedDistanceKm(null);

    intervalRef.current = setInterval(async () => {
      const point = routeCoords[indexRef.current];
      if (!point) {
        stopSimulation();
        return;
      }

      setCurrentSimPosition(point);

      console.log(`[SIM] enviando ponto ${indexRef.current}/${routeCoords.length}`, point);
      try {
        await updateRouteLocation(point);
      } catch (error) {
        console.log("[SIM ERROR]", error);
      }

      indexRef.current += 1;
    }, 1000);
  }

  function stopSimulation() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSimulating(false);
    setCurrentSimPosition(null);
    // Calcular distância total simulada ao finalizar
    const totalDistance = routeCoords.length > 1 ? calculateAccumulatedDistance(routeCoords) : 0;
    setSimulatedDistanceKm(totalDistance);
    // Trigger callback for DEV checkin
    onSimulationEnd?.(totalDistance);
  }

  return { simulating, startSimulation, stopSimulation, currentSimPosition, simulatedDistanceKm };
}