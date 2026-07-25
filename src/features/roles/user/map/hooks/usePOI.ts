import { useState } from "react";
import { LocationObject } from "expo-location";
import { PoiNearby } from "@/src/features/roles/user/map/poi/services/poiService";

export function usePOI(location: LocationObject | null) {
  const [openTouristPOIMarker, setOpenTouristPOIMarker] = useState<PoiNearby | null>(null);
  const [openShopPOIMarker, setOpenShopPOIMarker] = useState<PoiNearby | null>(null);
  const [openPOIMarker, setOpenPOIMarker] = useState<PoiNearby | null>(null);

  return {
    openTouristPOIMarker,
    setOpenTouristPOIMarker,
    openShopPOIMarker,
    setOpenShopPOIMarker,
    setOpenPOIMarker
  }
}