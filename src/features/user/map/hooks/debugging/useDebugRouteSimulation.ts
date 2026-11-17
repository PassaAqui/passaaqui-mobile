import { useRef, useState } from "react";
import { updateRouteLocation, calculateAccumulatedDistance } from "@/src/services/routeService";

interface Coordinate {
  latitude: number;
  longitude: number;
}

const MAX_SIMULATION_DURATION_MS = 15_000;

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

    const firstPoint = routeCoords[0];
    setCurrentSimPosition(firstPoint);
    void updateRouteLocation(firstPoint).catch((error) => {
      console.log("[SIM ERROR]", error);
    });

    if (routeCoords.length === 1) {
      stopSimulation(true);
      return;
    }

    const intervalMs = Math.max(
      1,
      Math.floor(MAX_SIMULATION_DURATION_MS / (routeCoords.length - 1))
    );
    indexRef.current = 1;

    intervalRef.current = setInterval(async () => {
      const point = routeCoords[indexRef.current];
      if (!point) {
        // Reaching the end of the list is the only successful completion.
        // Calling stopSimulation from the UI must be treated as cancellation.
        stopSimulation(true);
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
      if (indexRef.current >= routeCoords.length) {
        stopSimulation(true);
      }
    }, intervalMs);
  }

  function stopSimulation(completed = false) {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setSimulating(false);
    setCurrentSimPosition(null);

    if (!completed) {
      // A cancellation must not look like an arrival to the check-in flow.
      setSimulatedDistanceKm(null);
      return;
    }

    const totalDistance = routeCoords.length > 1 ? calculateAccumulatedDistance(routeCoords) : 0;
    setSimulatedDistanceKm(totalDistance);
    onSimulationEnd?.(totalDistance);
  }

  return { simulating, startSimulation, stopSimulation, currentSimPosition, simulatedDistanceKm };
}
