import { useLocation } from "@/src/features/user/map/hooks/useLocation";
import { useBoundsCheck } from "@/src/features/user/map/hooks/useBoundsCheck";
import { usePOI } from "@/src/features/user/map/hooks/usePOI";
import { useNavigation } from "@/src/features/user/map/hooks/useNavigation";
import { useGpsStatus } from "@/src/features/user/map/hooks/useGpsStatus";
import { useLocationTracking } from "@/src/features/user/map/hooks/useLocationTracking";
import { useCityEntry } from "@/src/features/user/map/hooks/useCityEntry";
import { useNearbyPois } from "@/src/features/user/map/poi/hooks/useNearbyPois";
import { useRouteSocket } from "@/src/features/user/map/hooks/useRouteSocket";
import { useAutoFollowDuringNavigation } from "@/src/features/user/map/hooks/useAutoFollowDuringNavigation";
import { RouteMode } from "@/src/services/routeService";
import { useState, useRef } from "react";
import { type CameraRef } from "@maplibre/maplibre-react-native";
import { MARCO_ZERO_RECIFE } from "@/src/constants/user/map/coordinates";

import { useDebugRouteSimulation } from "@/src/features/user/map/hooks/debugging/useDebugRouteSimulation";
import { checkinAtPoi } from "@/src/services/routeService";

export function useMapScreen() {
  const cameraRef = useRef<CameraRef>(null);
  const { location, mapRef, mapReady, setMapReady, lastUpdate, isFollowing, setIsFollowing, enableAutoFollow, disableAutoFollow } = useLocation(cameraRef);
  const { gpsActive } = useGpsStatus(lastUpdate);
  const [mapCenter, setMapCenter] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locomotionMode, setLocomotionMode] = useState<RouteMode | null>(null);
  const { touristPois, shopPois } = useNearbyPois(location, mapCenter, locomotionMode);
  const poi = usePOI(location);
  const navigation = useNavigation(location, mapRef, cameraRef);
  const bounds = useBoundsCheck(location);
  const cityEntry = useCityEntry(location);
  const [checkinReward, setCheckinReward] = useState<{ xp: number } | null>(null);

  // Quando terminar de fazer o teste pra saber se o checkin ta pegando, REMOVER essa linha e o import
  const { simulating, startSimulation, stopSimulation, currentSimPosition, simulatedDistanceKm } = useDebugRouteSimulation({
    routeCoords: navigation.routeCoords,
    onSimulationEnd: async (simulatedDistanceKm: number) => {
      if (navigation.currentPoiId) {
        try {
          // Em DEV, usa a distância simulada
          const result = await checkinAtPoi(navigation.currentPoiId, simulatedDistanceKm);
          setCheckinReward({ xp: result.xp_concedido });
        } catch (e) {
          console.log("[checkin SIM ERROR]", e);
        }
      }
      navigation.setStop(false);
      navigation.setRouteCoords([]);
    },
  });

  const { getAccumulatedDistance } = useLocationTracking(location, navigation.stop, simulating); // Quando terminar de fazer o teste pra saber se o checkin ta pegando, REMOVER o argumento 'simulating'

  useRouteSocket({
    onCheckin: (result) => {
      setCheckinReward({ xp: result.xp_concedido });
      navigation.handleStopNavigation();
    },
    onRouteEnded: async () => {
      if (navigation.currentPoiId) {
        try {
          // Prioridade: distância real (PROD) > simulada (DEV) > planejada (fallback)
          const realDistance = getAccumulatedDistance();
          const distanceKm = realDistance > 0.1
            ? realDistance
            : (simulatedDistanceKm ?? navigation.plannedDistanceKm ?? undefined);

          const result = await checkinAtPoi(navigation.currentPoiId, distanceKm);
          setCheckinReward({ xp: result.xp_concedido });
        } catch (e) {
          console.log("[checkin ERROR]", e);
        }
      }
      navigation.setStop(false);
      navigation.setRouteCoords([]);
    },
  });

  const userPosition = currentSimPosition ?? (!__DEV__ && location?.coords ? { latitude: location.coords.latitude, longitude: location.coords.longitude } : null) ?? MARCO_ZERO_RECIFE;

  useAutoFollowDuringNavigation({
    userPosition,
    cameraRef,
    isNavigationActive: navigation.stop,
  });

  return {
    location, mapRef, cameraRef, mapReady, setMapReady, isFollowing, setIsFollowing, enableAutoFollow, disableAutoFollow,
    mapCenter, setMapCenter,
    locomotionMode, setLocomotionMode,
    gpsActive,
    touristPois, shopPois,
    checkinReward, setCheckinReward,
    simulating, startSimulation, stopSimulation, currentSimPosition, simulatedDistanceKm, // Quando terminar de fazer o teste pra saber se o checkin ta pegando, REMOVER o essa linha
    ...poi,
    ...navigation,
    ...bounds,
    ...cityEntry
  };
}
