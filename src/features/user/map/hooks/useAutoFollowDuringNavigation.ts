import { useEffect } from "react";
import MapView from "react-native-maps";

export interface UseAutoFollowDuringNavigationProps {
  userPosition: { latitude: number; longitude: number } | null;
  mapRef: React.RefObject<MapView | null>;
  isNavigationActive: boolean;
}

export function useAutoFollowDuringNavigation({
  userPosition,
  mapRef,
  isNavigationActive,
}: UseAutoFollowDuringNavigationProps) {
  useEffect(() => {
    if (!isNavigationActive || !userPosition || !mapRef.current) {
      return;
    }

    mapRef.current.animateCamera({
      center: {
        latitude: userPosition.latitude,
        longitude: userPosition.longitude,
      },
    });
  }, [userPosition, isNavigationActive, mapRef]);
}