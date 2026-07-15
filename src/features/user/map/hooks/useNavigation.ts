import { useState, useEffect } from "react";
import MapView from "react-native-maps";
import { useStartRouteSession, useDirection, useEndRouteSession, useCurrentRouteSession } from "@/src/features/user/map/hooks/useRouteSession";
import { RouteMode, getDirection } from "@/src/services/routeService";
import { LocationObject } from "expo-location";

interface PendingNavigation {
  destination: { latitude: number; longitude: number };
  mode: RouteMode;
  poiId?: number;
}

export function useNavigation(location: LocationObject | null, mapRef: React.RefObject<MapView | null>) {
  const [routeCoords, setRouteCoords] = useState<{ latitude: number; longitude: number }[]>([]);
  const [stop, setStop] = useState<boolean>(false);
  const [showStopConfirmation, setShowStopConfirmation] = useState<boolean>(false);
  const [showSwitchDestinationModal, setShowSwitchDestinationModal] = useState<boolean>(false);
  const [pendingNavigation, setPendingNavigation] = useState<PendingNavigation | null>(null);

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

  async function executeNavigation(destination: { latitude: number; longitude: number }, mode: RouteMode, poiId?: number) {
    const origin = {
      //latitude: location?.coords.latitude,
      //longitude: location?.coords.longitude

      latitude: -8.0675,
      longitude: -34.9167,
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

  async function handleNavigation(destination: { latitude: number; longitude: number }, mode: RouteMode = "foot-walking", poiId?: number) {
    if (stop) {
      setPendingNavigation({ destination, mode, poiId });
      setShowSwitchDestinationModal(true);
      return;
    }

    executeNavigation(destination, mode, poiId);
  }

  async function confirmSwitchDestination() {
    if (!pendingNavigation) return;

    try {
      await endRouteSessionMutation.mutateAsync();
    } catch (error) {
      console.log(`[useNavigation ERROR]: Erro ao cancelar rota anterior ${error}`);
    }

    setStop(false);
    setRouteCoords([]);

    const { destination, mode, poiId } = pendingNavigation;
    setPendingNavigation(null);
    setShowSwitchDestinationModal(false);

    await executeNavigation(destination, mode, poiId);
  }

  function cancelSwitchDestination() {
    setPendingNavigation(null);
    setShowSwitchDestinationModal(false);
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
    showSwitchDestinationModal,
    confirmSwitchDestination,
    cancelSwitchDestination,
    handleNavigation,
    handleStopNavigation
  };
}