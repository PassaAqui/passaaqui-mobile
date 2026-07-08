import { useState, useEffect } from "react";
import MapView from "react-native-maps";
import { useStartRouteSession, useDirection, useEndRouteSession, useCurrentRouteSession } from "@/src/features/user/map/hooks/useRouteSession";
import { RouteMode, getDirection } from "@/src/services/routeService";

export function useNavigation(mapRef: React.RefObject<MapView | null>) {
  const [routeCoords, setRouteCoords] = useState<{ latitude: number; longitude: number }[]>([]);
  const [stop, setStop] = useState<boolean>(false);
  const [showStopConfirmation, setShowStopConfirmation] = useState<boolean>(false);
  const startRouteSession = useStartRouteSession();
  const direction = useDirection();
  const endRouteSessionMutation = useEndRouteSession();
  const currentSession = useCurrentRouteSession();

  useEffect(() => {
    async function restoreSession() {
      try {
        const { data } = await currentSession.refetch();
        if (data?.status === "ACTIVE" && data.destination) {
          setStop(true);
          const { coordinates } = await getDirection({
            mode: data.destination.mode,
            startLatitude: data.destination.startLatitude,
            startLongitude: data.destination.startLongitude,
            endLatitude: data.destination.stopLatitude,
            endLongitude: data.destination.stopLongitude,
            poiId: data.destination.poiId,
          });
          setRouteCoords(coordinates);
        }
      } catch { }
    }
    restoreSession();
  }, []);

  async function handleNavigation(destination: { latitude: number; longitude: number }, mode: RouteMode = "foot-walking", poiId?: number) {
    const origin = {
      latitude: -7.94009,
      longitude: -34.8723,
    };

    try {
      await startRouteSession.mutateAsync({
        latitude: origin.latitude,
        longitude: origin.longitude,
        poiId,
      });

      const { coordinates } = await direction.mutateAsync({
        mode,
        startLatitude: origin.latitude,
        startLongitude: origin.longitude,
        endLatitude: destination.latitude,
        endLongitude: destination.longitude,
        poiId,
      });

      setRouteCoords(coordinates);

      mapRef.current?.fitToCoordinates(coordinates, {
        edgePadding: { top: 80, right: 40, bottom: 80, left: 40 },
        animated: true,
      });
    } catch (error) {
      console.log(`[useNavigation ERROR]: Erro ao traçar a rota ${error}`);
    } finally {
      setStop(true);
    }
  }

  async function handleStopNavigation() {
    try {
      await endRouteSessionMutation.mutateAsync();
    } catch (error) {
      console.log(`[useNavigation ERROR]: Erro ao encerrar a rota ${error}`);
    } finally {
      setStop(false);
      setRouteCoords([]);
      setShowStopConfirmation(false);
    }
  }

  return {
    loadingRoute: startRouteSession.isPending || direction.isPending,
    routeCoords, setRouteCoords,
    stop, setStop,
    showStopConfirmation, setShowStopConfirmation,
    handleNavigation,
    handleStopNavigation,
  };
}