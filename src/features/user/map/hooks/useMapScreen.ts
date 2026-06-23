import { useLocation } from "@/src/features/user/map/hooks/useLocation";
import { useBoundsCheck } from "@/src/features/user/map/hooks/useBoundsCheck";
import { usePOI } from "@/src/features/user/map/hooks/usePOI";
import { useNavigation } from "@/src/features/user/map/hooks/useNavigation";

export function useMapScreen() {
  const { location, mapRef, mapReady, setMapReady } = useLocation();
  const poi = usePOI(location);
  const navigation = useNavigation(mapRef);
  const bounds = useBoundsCheck(location);

  return {
    location, mapRef, mapReady, setMapReady,
    ...poi,
    ...navigation,
    ...bounds
  }
}