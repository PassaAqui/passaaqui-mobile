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
import { useState } from "react";

import { useDebugRouteSimulation } from "@/src/features/user/map/hooks/debugging/useDebugRouteSimulation";

export function useMapScreen() {
  const { location, mapRef, mapReady, setMapReady, lastUpdate, isFollowing, setIsFollowing, enableAutoFollow, disableAutoFollow } = useLocation();
  const { gpsActive } = useGpsStatus(lastUpdate);
  const [mapCenter, setMapCenter] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locomotionMode, setLocomotionMode] = useState<RouteMode | null>(null);
  const { touristPois, shopPois } = useNearbyPois(location, mapCenter, locomotionMode);
  const poi = usePOI(location);
  const navigation = useNavigation(location, mapRef);
  const bounds = useBoundsCheck(location);
  const cityEntry = useCityEntry(location);
  const [checkinReward, setCheckinReward] = useState<{ xp: number } | null>(null);

  // Quando terminar de fazer o teste pra saber se o checkin ta pegando, REMOVER essa linha e o import
  const { simulating, startSimulation, stopSimulation, currentSimPosition } = useDebugRouteSimulation(navigation.routeCoords);

  useLocationTracking(location, navigation.stop, simulating); // Quando terminar de fazer o teste pra saber se o checkin ta pegando, REMOVER o argumento 'simulating'

  useRouteSocket({
    onCheckin: (result) => {
      setCheckinReward({ xp: result.xp_concedido });
      navigation.handleStopNavigation();
    },
    onRouteEnded: () => {
      navigation.setStop(false);
      navigation.setRouteCoords([]);
    },
  });

  const userPosition = currentSimPosition ?? (!__DEV__ && location?.coords ? { latitude: location.coords.latitude, longitude: location.coords.longitude } : null) ?? { latitude: -8.0675, longitude: -34.9167 };

  useAutoFollowDuringNavigation({
    userPosition,
    mapRef,
    isNavigationActive: navigation.stop,
  });

  return {
    location, mapRef, mapReady, setMapReady, isFollowing, setIsFollowing, enableAutoFollow, disableAutoFollow,
    mapCenter, setMapCenter,
    locomotionMode, setLocomotionMode,
    gpsActive,
    touristPois, shopPois,
    checkinReward, setCheckinReward,
    simulating, startSimulation, stopSimulation, currentSimPosition, // Quando terminar de fazer o teste pra saber se o checkin ta pegando, REMOVER o essa linha
    ...poi,
    ...navigation,
    ...bounds,
    ...cityEntry
  };
}