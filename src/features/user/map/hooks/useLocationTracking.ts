import { useEffect, useRef } from "react";
import { useUpdateRouteLocation } from "@/src/features/user/map/hooks/useRouteSession";
import { startRouteSession, haversineDistance } from "@/src/services/routeService";
import { AxiosError } from "axios";
import { LocationObject } from "expo-location";

interface Coordinate {
  latitude: number;
  longitude: number;
}

export function useLocationTracking(location: LocationObject | null, active: boolean, paused: boolean = false) { // Quando terminar de fazer o teste pra saber se o checkin ta pegando, REMOVER o parâmetro 'paused'
  const updateLocation = useUpdateRouteLocation();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const accumulatedDistanceRef = useRef(0);
  const lastPositionRef = useRef<Coordinate | null>(null);

  const getAccumulatedDistance = () => accumulatedDistanceRef.current;

  useEffect(() => {
    if (!active || paused) { // Quando terminar de fazer o teste pra saber se o checkin ta pegando, REMOVER o '|| paused'
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(async () => {
      if (!location) return;

      const coords: Coordinate = {
        //latitude: location.coords.latitude,
        //longitude: location.coords.longitude

        latitude: -8.0675,
        longitude: -34.9167
      }

      // Acumular distância real (PROD) - usa GPS real quando disponível
      if (!__DEV__ && location?.coords && lastPositionRef.current) {
        const realCoords: Coordinate = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        accumulatedDistanceRef.current += haversineDistance(lastPositionRef.current, realCoords);
        lastPositionRef.current = realCoords;
      } else if (__DEV__) {
        // Em DEV, usa coords fixos para simulação
        if (lastPositionRef.current) {
          accumulatedDistanceRef.current += haversineDistance(lastPositionRef.current, coords);
        }
        lastPositionRef.current = coords;
      }

      try {
        await updateLocation.mutateAsync(coords);
      } catch (error) {
        const status = error instanceof AxiosError ? error.response?.status : null;

        if (status === 400) {
          console.log("[tracking WARN] Sessão expirada, recriando...");
          try {
            await startRouteSession(coords);
          } catch (restartError) {
            console.log("[tracking ERROR] Falha ao recriar sessão", restartError);
          }
        } else if (status === 401 || status === 403) {
          console.log(`[tracking ERROR] Falha de autenticação (${status}). Parando tracking.`);
          if (intervalRef.current) clearInterval(intervalRef.current);
        } else {
          console.log("[tracking ERROR] Erro inesperado no tracking", error);
        }
      }
    }, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [active, paused, location]); // Quando terminar de fazer o teste pra saber se o checkin ta pegando, REMOVER o 'paused'

  return { getAccumulatedDistance };
}