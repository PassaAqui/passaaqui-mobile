import { useLocation } from "@/src/features/user/map/hooks/useLocation";
import { useBoundsCheck } from "@/src/features/user/map/hooks/useBoundsCheck";
import { usePOI } from "@/src/features/user/map/hooks/usePOI";
import { useNavigation } from "@/src/features/user/map/hooks/useNavigation";
import { useGpsStatus } from "@/src/features/user/map/hooks/useGpsStatus";

export function useMapScreen() {
  const { location, mapRef, mapReady, setMapReady, lastUpdate } = useLocation();
  const { gpsActive } = useGpsStatus(lastUpdate);
  const poi = usePOI(location);
  const navigation = useNavigation(mapRef);
  const bounds = useBoundsCheck(location);

  return {
    location, mapRef, mapReady, setMapReady,
    gpsActive,
    ...poi,
    ...navigation,
    ...bounds
  }
}