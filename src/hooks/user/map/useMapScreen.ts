import MapView from "react-native-maps";
import { useState, useEffect, useRef } from "react";
import { requestForegroundPermissionsAsync, getCurrentPositionAsync, LocationObject, watchPositionAsync, LocationAccuracy } from "expo-location";
import { touristPOIs, shopPOIs } from "@/src/constants/user/map/poi";
import { PAULISTA_BOUNDS } from "@/src/constants/user/map/map";
import { getRoute } from "@/src//services/routeService";
import * as NavigationBar from "expo-navigation-bar";

export function useMapScreen() {
  const [location, setLocation] = useState<LocationObject | null>(null);
  const mapRef = useRef<MapView>(null);
  const [showAlertModal, setShowAlertModal] = useState<boolean>(false);
  const [openTouristPOIMarker, setOpenTouristPOIMarker] = useState<typeof touristPOIs[0] | null>(null);
  const [openShopPOIMarker, setOpenShopPOIMarker] = useState<typeof shopPOIs[0] | null>(null);
  const [openPOIMarker, setOpenPOIMarker] = useState<typeof shopPOIs[0] | typeof touristPOIs[0] | null>(null);
  const [routeCoords, setRouteCoords] = useState<{ latitude: number, longitude: number }[]>([]);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [routeDistance, setRouteDistance] = useState<number | string | null>(null);
  const [stop, setStop] = useState<boolean>(false);
  const [showStopConfirmation, setShowStopConfirmation] = useState<boolean>(false);

  async function requestLocationPermission() {
    const { granted } = await requestForegroundPermissionsAsync();

    if (!granted) {
      // Colocar um modal aqui falando que recomendamos ativar a localização para uma melhor experiência com o aplicativo...
      console.log("[WARN LOCATION]: Permissão negada");
      return;
    }

    const currentPosition = await getCurrentPositionAsync({
      accuracy: LocationAccuracy.Balanced
    });
    console.log(currentPosition);
    setLocation(currentPosition);

    return true;
  }

  useEffect(() => {
    let subscription: {remove: () => void } | null = null;

    async function getLocation() {
      const isLocationPermission = await requestLocationPermission();

      if (isLocationPermission) {
        subscription = await watchPositionAsync({
          accuracy: LocationAccuracy.Highest,
          timeInterval: 1000,
          distanceInterval: 1
        }, (response) => {
          setLocation(response);
          checkLocation();
          mapRef.current?.animateCamera({
            center: {
              //latitude: response.coords.latitude,
              //longitude: response.coords.longitude
              latitude: -7.94009,
              longitude: -34.8723
            },
            zoom: 19
          });
        });
      }
    }

    getLocation();

    return () => {
      subscription?.remove()
    }
  }, []);


  const checkLocation = (): void => {
    if (!location) {
      return;
    }

    
    const latitudeDentroDoLimite =
    //location.coords.latitude >= PAULISTA_BOUNDS.latitudeMin &&
    //location.coords.latitude <= PAULISTA_BOUNDS.latitudeMax;
    //-8.2832 >= PAULISTA_BOUNDS.latitudeMin &&
    //-8.2832 <= PAULISTA_BOUNDS.latitudeMax;
    -7.94009 >= PAULISTA_BOUNDS.latitudeMin &&
    -7.94009 <= PAULISTA_BOUNDS.latitudeMax;

    const longitudeDentroDoLimite =
      //location.coords.longitude >= PAULISTA_BOUNDS.longitudeMin &&
      //location.coords.longitude <= PAULISTA_BOUNDS.longitudeMax;
      -34.8723 >= PAULISTA_BOUNDS.longitudeMin &&
      -34.8723  <= PAULISTA_BOUNDS.longitudeMax;

    if (latitudeDentroDoLimite && longitudeDentroDoLimite) {
      setShowAlertModal(false);
      console.log("LOCATION ATUAL DENTRO DE PAULISTA: " + location)
      console.log("DENTRO DE PAULISTA - mostrando modal");
      return;
    }
    
    console.log("LOCATION ATUAL FORA DE PAULISTA: " + location)
    console.log("FORA DE PAULISTA - mostrando modal");
    setShowAlertModal(true);
  }

  useEffect(() => {
    checkLocation();
  }, [location])
  
  useEffect(() => {
    if (!openPOIMarker) return;

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
        setRouteDistance(distance);

      } catch (error) {
        console.log(`[useEffect user/map ERROR]: Erro ao pegar a distância ${error}`);
      }
    }
    
    getDistance();

  }, [openPOIMarker]);

  useEffect(() => {
    NavigationBar.setButtonStyleAsync("dark");
  }, []);


  async function handleNavigation(destination: { latitude: number, longitude: number }, mode: "driving-car" | "foot-walking" | "cycling-regular" = "foot-walking") {
    if (!location) return;

    setLoadingRoute(true);

    try {
      const origin = {
        //latitude: location.coords.latitude,
        //longitude: location.coords.longitude
        latitude: -7.94009,
        longitude: -34.8723
      }

      const { coordinates, distance } = await getRoute(origin, destination, mode);
      setRouteCoords(coordinates);

      mapRef.current?.fitToCoordinates(coordinates, {
        edgePadding: {
          top: 80,
          right: 40,
          bottom: 80,
          left: 40
        },
        animated: true
      });
    } catch (error) {
      console.log(`[user/map ERROR]: Erro ao traçar a rota ${error}`);
    } finally {
      setLoadingRoute(false);
      setStop(true);
    }
  }

  return {
    location,
    loadingRoute,
    mapRef,
    setOpenTouristPOIMarker,
    openTouristPOIMarker,
    setOpenShopPOIMarker,
    openShopPOIMarker,
    setOpenPOIMarker,
    routeCoords,
    stop,
    showAlertModal,
    setShowAlertModal,
    handleNavigation,
    setShowStopConfirmation,
    showStopConfirmation,
    setStop,
    setRouteCoords,
    routeDistance
  }
}