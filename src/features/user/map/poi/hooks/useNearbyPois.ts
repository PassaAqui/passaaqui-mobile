import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { LocationObject } from "expo-location";
import { getPoisNearby } from "@/src/features/user/map/poi/services/poiService";

function roundCoord(value: number) {
  return Math.round(value * 1000) / 1000; // ~111m de precisão
}

export function useNearbyPois(location: LocationObject | null) {
  
  /*
  const latitude = location?.coords.latitude;
  const longitude = location?.coords.longitude;
  */

  // Valores fixos apenas em dev
  const latitude = -8.0675;
  const longitude = -34.9167;

  const roundedLat = roundCoord(latitude);
  const roundedLng = roundCoord(longitude);
  const hasCoords = !!location;

  const { data } = useQuery({
    queryKey: ["pois-nearby", roundedLat, roundedLng],
    queryFn: () => getPoisNearby(latitude, longitude, "foot-walking"),
    enabled: hasCoords,
    staleTime: 1 * 60 * 1000, // 2 minutos
  });

  const touristPois = useMemo(
    () => data?.filter((p) => p.type === "TOURIST_POINT") ?? [],
    [data]
  );

  const shopPois = useMemo(
    () => data?.filter((p) => p.type === "STORE") ?? [],
    [data]
  );

  return { touristPois, shopPois }
}