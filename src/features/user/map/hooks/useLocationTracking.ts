import { useEffect, useRef } from "react";
import { useUpdateRouteLocation } from "@/src/features/user/map/hooks/useRouteSession";
import { startRouteSession } from "@/src/services/routeService";
import { AxiosError } from "axios";
import { LocationObject } from "expo-location";

export function useLocationTracking(location: LocationObject | null, active: boolean, paused: boolean = false) { // Quando terminar de fazer o teste pra saber se o checkin ta pegando, REMOVER o parâmetro 'paused'
  const updateLocation = useUpdateRouteLocation();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!active || paused) { // Quando terminar de fazer o teste pra saber se o checkin ta pegando, REMOVER o '|| paused'
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(async () => {
      if (!location) return;

      const coords = {
        //latitude: location.coords.latitude,
        //longitude: location.coords.longitude

        latitude: -8.0675,
        longitude: -34.9167
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
  }, [active, paused]); // Quando terminar de fazer o teste pra saber se o checkin ta pegando, REMOVER o 'paused'
}