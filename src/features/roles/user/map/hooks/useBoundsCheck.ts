import { LocationObject } from "expo-location";
import { RECIFE_BOUNDS } from "@/src/constants/user/map/map";
import { useState, useEffect } from "react";

export function useBoundsCheck(location: LocationObject | null) {
  const [showAlertModal, setShowAlertModal] = useState<boolean>(false);

  useEffect(() => {
    if (!location) return;
    
    const isLatitudeWithinBounds =
    // location.coords.latitude >= RECIFE_BOUNDS.latitudeMin &&
    // location.coords.latitude <= RECIFE_BOUNDS.latitudeMax;

    /* Valores do centro de Recife (deixar assim apenas enquanto ta em desenvolvimento) */
    -8.0675 >= RECIFE_BOUNDS.latitudeMin &&
    -8.0675 <= RECIFE_BOUNDS.latitudeMax;

    const isLongitudeWithinBounds =
      // location.coords.longitude >= RECIFE_BOUNDS.longitudeMin &&
      // location.coords.longitude <= RECIFE_BOUNDS.longitudeMax;

      /* Valores do centro de Recife (deixar assim apenas enquanto ta em desenvolvimento) */
      -34.9167 >= RECIFE_BOUNDS.longitudeMin &&
      -34.9167  <= RECIFE_BOUNDS.longitudeMax;

    if (isLatitudeWithinBounds && isLongitudeWithinBounds) {
      setShowAlertModal(false);
      console.log("LOCATION ATUAL DENTRO DE RECIFE: ", location)
      console.log("DENTRO DE RECIFE - sem mostrar modal");
      return;
    }
    
    console.log("LOCATION ATUAL FORA DE RECIFE: ", location)
    console.log("FORA DE RECIFE - mostrando modal");
    setShowAlertModal(true);
  }, [location]);

  return { showAlertModal, setShowAlertModal };
}