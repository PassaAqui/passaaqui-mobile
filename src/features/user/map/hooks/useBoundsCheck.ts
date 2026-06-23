import { LocationObject } from "expo-location";
import { PAULISTA_BOUNDS } from "@/src/constants/user/map/map";
import { useState, useEffect } from "react";

export function useBoundsCheck(location: LocationObject | null) {
  const [showAlertModal, setShowAlertModal] = useState<boolean>(false);

  useEffect(() => {
    if (!location) return;
    
    const isLatitudeWithinBounds =
    //location.coords.latitude >= PAULISTA_BOUNDS.latitudeMin &&
    //location.coords.latitude <= PAULISTA_BOUNDS.latitudeMax;
    //-8.2832 >= PAULISTA_BOUNDS.latitudeMin &&
    //-8.2832 <= PAULISTA_BOUNDS.latitudeMax;
    -7.94009 >= PAULISTA_BOUNDS.latitudeMin &&
    -7.94009 <= PAULISTA_BOUNDS.latitudeMax;

    const isLongitudeWithinBounds =
      //location.coords.longitude >= PAULISTA_BOUNDS.longitudeMin &&
      //location.coords.longitude <= PAULISTA_BOUNDS.longitudeMax;
      -34.8723 >= PAULISTA_BOUNDS.longitudeMin &&
      -34.8723  <= PAULISTA_BOUNDS.longitudeMax;

    if (isLatitudeWithinBounds && isLongitudeWithinBounds) {
      setShowAlertModal(false);
      console.log("LOCATION ATUAL DENTRO DE PAULISTA: " + location)
      console.log("DENTRO DE PAULISTA - mostrando modal");
      return;
    }
    
    console.log("LOCATION ATUAL FORA DE PAULISTA: " + location)
    console.log("FORA DE PAULISTA - mostrando modal");
    setShowAlertModal(true);
  }, [location]);

  return { showAlertModal, setShowAlertModal };
}