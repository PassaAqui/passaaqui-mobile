import React, { useState } from "react";
import { getRoute } from "@/src/services/routeService";
import MapView from "react-native-maps";

export function useNavigation(mapRef: React.RefObject<MapView | null>) {
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [routeCoords, setRouteCoords] = useState<{ latitude: number, longitude: number }[]>([]);
  const [stop, setStop] = useState<boolean>(false);
  const [showStopConfirmation, setShowStopConfirmation] = useState<boolean>(false);

  async function handleNavigation(destination: { latitude: number, longitude: number }, mode: "driving-car" | "foot-walking" | "cycling-regular" = "foot-walking") {
    if (!location) return;

    setLoadingRoute(true);

    try {
      const origin = {
        //latitude: location.coords.latitude,
        //longitude: location.coords.longitude
        latitude: -7.94009,
        longitude: -34.8723
      }

      const { coordinates, distance } = await getRoute(origin, destination, mode);
      setRouteCoords(coordinates);

      mapRef.current?.fitToCoordinates(coordinates, {
        edgePadding: {
          top: 80,
          right: 40,
          bottom: 80,
          left: 40
        },
        animated: true
      });
    } catch (error) {
      console.log(`[user/map ERROR]: Erro ao traçar a rota ${error}`);
    } finally {
      setLoadingRoute(false);
      setStop(true);
    }
  }

  return {
    loadingRoute, setLoadingRoute,
    routeCoords, setRouteCoords,
    stop, setStop,
    showStopConfirmation, setShowStopConfirmation,
    handleNavigation
  }
}