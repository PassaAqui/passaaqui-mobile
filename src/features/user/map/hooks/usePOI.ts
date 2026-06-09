import { useState, useEffect } from "react";
import { LocationObject } from "expo-location";
import { touristPOIs, shopPOIs } from "@/src/constants/user/map/poi";
import { getRoute } from "@/src/services/routeService";

export function usePOI(location: LocationObject | null) {
  const [openTouristPOIMarker, setOpenTouristPOIMarker] = useState<typeof touristPOIs[0] | null>(null);
  const [openShopPOIMarker, setOpenShopPOIMarker] = useState<typeof shopPOIs[0] | null>(null);
  const [openPOIMarker, setOpenPOIMarker] = useState<typeof shopPOIs[0] | typeof touristPOIs[0] | null>(null);
  const [routeDistance, setRouteDistance] = useState<number | string | null>(null);

  useEffect(() => {
    if (!openPOIMarker) return;
    let cancelled: boolean = false;

    async function getDistance() {
      try {
        const origin = {
          //latitude: location.coords.latitude,
          //longitude: location.coords.longitude
          latitude: -7.94009,
          longitude: -34.8723
        }

        const destination = { latitude: openPOIMarker!.latitude, longitude: openPOIMarker!.longitude};
        const { distance } = await getRoute(origin, destination, "foot-walking");
        if (!cancelled) setRouteDistance(distance);

      } catch (error) {
        console.log(`[useEffect user/map ERROR]: Erro ao pegar a distância ${error}`);
      }
    }
    
    getDistance();
    return () => { cancelled = true };

  }, [openPOIMarker]);

  return {
    openTouristPOIMarker, setOpenTouristPOIMarker,
    openShopPOIMarker, setOpenShopPOIMarker,
    setOpenPOIMarker, routeDistance
  }
}