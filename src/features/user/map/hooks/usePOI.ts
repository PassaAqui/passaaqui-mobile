import { useState, useEffect } from "react";
import { LocationObject } from "expo-location";
import { touristPOIs, shopPOIs } from "@/src/constants/user/map/poi";

function haversineDistanceKm(pointA: { latitude: number; longitude: number }, pointB: { latitude: number; longitude: number }) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371;
  const distanceLat = toRad(pointB.latitude - pointA.latitude);
  const distanceLon = toRad(pointB.longitude - pointA.longitude);
  const lat1 = toRad(pointA.latitude);
  const lat2 = toRad(pointB.latitude);

  const h = Math.sin(distanceLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(distanceLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return R * c;
}

export function usePOI(location: LocationObject | null) {
  const [openTouristPOIMarker, setOpenTouristPOIMarker] = useState<typeof touristPOIs[0] | null>(null);
  const [openShopPOIMarker, setOpenShopPOIMarker] = useState<typeof shopPOIs[0] | null>(null);
  const [openPOIMarker, setOpenPOIMarker] = useState<typeof shopPOIs[0] | typeof touristPOIs[0] | null>(null);
  const [routeDistance, setRouteDistance] = useState<number | string | null>(null);

   useEffect(() => {
    if (!openPOIMarker) return;

    const origin = { latitude: -7.94009, longitude: -34.8723 };
    const destination = { latitude: openPOIMarker.latitude, longitude: openPOIMarker.longitude };
    
    setRouteDistance(haversineDistanceKm(origin, destination).toFixed(1));
  }, [openPOIMarker]);

  return {
    openTouristPOIMarker,
    setOpenTouristPOIMarker,
    openShopPOIMarker,
    setOpenShopPOIMarker,
    setOpenPOIMarker,
    routeDistance,
  };
}