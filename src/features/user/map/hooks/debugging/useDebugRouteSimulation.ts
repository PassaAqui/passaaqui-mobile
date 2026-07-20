import { useRef, useState } from "react";
import { updateRouteLocation } from "@/src/services/routeService";

interface Coordinate {
  latitude: number;
  longitude: number;
}

export function useDebugRouteSimulation(routeCoords: Coordinate[]) {
  const [simulating, setSimulating] = useState(false);
  const [currentSimPosition, setCurrentSimPosition] = useState<Coordinate | null>(null); // <- novo
  const indexRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function startSimulation() {
    if (!routeCoords.length) return;
    indexRef.current = 0;
    setSimulating(true);

    intervalRef.current = setInterval(async () => {
      const point = routeCoords[indexRef.current];
      if (!point) {
        stopSimulation();
        return;
      }

      setCurrentSimPosition(point); // <- atualiza a posição visual

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
  }

  return { simulating, startSimulation, stopSimulation, currentSimPosition };
}