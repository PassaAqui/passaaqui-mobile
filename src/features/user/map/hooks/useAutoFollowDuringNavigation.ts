import { useEffect } from "react";
import { type CameraRef } from "@maplibre/maplibre-react-native";
import { toLngLat } from "@/src/constants/user/map/coordinates";

export interface UseAutoFollowDuringNavigationProps {
  userPosition: { latitude: number; longitude: number } | null;
  cameraRef: React.RefObject<CameraRef | null>;
  isNavigationActive: boolean;
}

export function useAutoFollowDuringNavigation({
  userPosition,
  cameraRef,
  isNavigationActive,
}: UseAutoFollowDuringNavigationProps) {
  useEffect(() => {
    if (!isNavigationActive || !userPosition || !cameraRef.current) {
      return;
    }

    cameraRef.current.easeTo({
      center: toLngLat(userPosition),
    });
  }, [userPosition, isNavigationActive, cameraRef]);
}
