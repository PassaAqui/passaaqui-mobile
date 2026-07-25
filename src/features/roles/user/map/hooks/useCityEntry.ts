import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LocationObject } from "expo-location";
import { getCityData, CityResponse } from "@/src/features/roles/user/map/postcard/services/postcardService";
import { useVisitedCitiesStore } from "@/src/stores/user/map/visitedCitiesStore";

/*
 * Arredonda a coordenada pra não disparar uma request nova a cada
 * micro-atualização do GPS (watchPositionAsync já dispara a cada 2m).
 * 3 casas decimais ~ 111m de precisão — de sobra pra saber "em qual
 * cidade" o usuário está.
*/

function roundCoord(value: number) {
  return Math.round(value * 1000) / 1000;
}

export function useCityEntry(location: LocationObject | null) {
  const { hasVisitedCity, markCityAsVisited, visitedCityIds } = useVisitedCitiesStore();
  const [cityToShow, setCityToShow] = useState<CityResponse | null>(null);

  const latitude = -8.0675; // location?.coords.latitude
  const longitude = -34.9167; // location?.coords.longitude

  const hasCoords = !!location;
  const roundedLat = roundCoord(latitude);
  const roundedLng = roundCoord(longitude);


  const { data: city, isLoading: loadingCity, isError, error, isSuccess } = useQuery({
    queryKey: ["city-locate", roundedLat, roundedLng],
    queryFn: () => getCityData(latitude, longitude),
    enabled: hasCoords,
    staleTime: 5 * 60 * 1000 // 5 minutos
  });

  console.log("[useCityEntry] estado da query:", { hasCoords, isLoading: loadingCity, isSuccess, isError, error, city });

  useEffect(() => {
    if (!city) return;
    console.log("[useCityEntry] cidade recebida:", city);
    console.log("[useCityEntry] já visitada?", hasVisitedCity(city.cityId), visitedCityIds);
    if (hasVisitedCity(city.cityId)) {
      console.log("[useCityEntry] já visitada, ignorando");
      return;
    }

    markCityAsVisited(city.cityId);
    setCityToShow(city);
  }, [city]);

  const dismissCity = () => setCityToShow(null);

  return { cityToShow, dismissCity, loadingCity };
}