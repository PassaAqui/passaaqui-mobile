import { useLocation } from "@/src/features/user/map/hooks/useLocation";
import { useBoundsCheck } from "@/src/features/user/map/hooks/useBoundsCheck";
import { usePOI } from "@/src/features/user/map/hooks/usePOI";
import { useNavigation } from "@/src/features/user/map/hooks/useNavigation";
import { useGpsStatus } from "@/src/features/user/map/hooks/useGpsStatus";
import { useLocationTracking } from "@/src/features/user/map/hooks/useLocationTracking";
import { useCityEntry } from "@/src/features/user/map/hooks/useCityEntry";
import { useNearbyPois } from "@/src/features/user/map/poi/hooks/useNearbyPois";

export function useMapScreen() {
  const { location, mapRef, mapReady, setMapReady, lastUpdate, isFollowing, setIsFollowing } = useLocation();
  const { gpsActive } = useGpsStatus(lastUpdate);
  const { touristPois, shopPois } = useNearbyPois(location);
  const poi = usePOI(location);
  const navigation = useNavigation(location, mapRef);
  const bounds = useBoundsCheck(location);
  const cityEntry = useCityEntry(location);

  useLocationTracking(location, navigation.stop);

  return {
    location, mapRef, mapReady, setMapReady, isFollowing, setIsFollowing,
    gpsActive,
    touristPois, shopPois,
    ...poi,
    ...navigation,
    ...bounds,
    ...cityEntry
  };
}