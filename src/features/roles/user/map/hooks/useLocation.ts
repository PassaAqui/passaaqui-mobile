import { useState, useRef, useEffect } from "react";
import {
  getCurrentPositionAsync,
  LocationObject,
  requestForegroundPermissionsAsync,
  watchPositionAsync,
  LocationAccuracy
} from "expo-location";
import MapView from "react-native-maps";

async function waitForLocation(maxRetries: number = 5, delayMs: number = 1000): Promise<boolean> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await getCurrentPositionAsync({ accuracy: LocationAccuracy.Balanced });
      return true;
    } catch {
      console.log(`[waitForLocation WARN] Falhou na tentativa ${attempt}. Tentando novamente...`)
      if (attempt <= maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }

  return false;
}

export function useLocation() {
  const [location, setLocation] = useState<LocationObject | null>(null);
  const mapRef = useRef<MapView>(null);
  const [mapReady, setMapReady] = useState<boolean>(false);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [initialPosition, setInitialPosition] = useState<boolean>(false);

  useEffect(() => {
    if (mapReady && mapRef.current && !location) {
      mapRef.current.animateToRegion({
        latitude: -8.0675, /* Centro de recife (Marco Zero) */
        longitude: -34.9167,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    }
  }, [mapReady, location]);

  useEffect(() => {
    if (location && mapReady && !initialPosition && !isFollowing && mapRef.current) {
      mapRef.current.animateToRegion({
        //latitude: response.coords.latitude,
        //longitude: response.coords.longitude

        /*
          Valores fixos apenas em dev, quando for fazer deploy usar as coordenadas reais do usuário
        */

       /*
        ===================
        VALORES DE PAULISTA
        ===================
        latitude: -7.94009,
        longitude: -34.8723,
        */
        latitude: -8.0675, /* Centro de recife (Marco Zero) */
        longitude: -34.9167,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
      setInitialPosition(true);
    }
  }, [location, mapReady, initialPosition, isFollowing]);

  useEffect(() => {
      let subscription: {remove: () => void } | null = null;
  
      async function getLocation() {
        const { granted } = await requestForegroundPermissionsAsync();
  
        if (!granted) {
          // Colocar um modal aqui falando que recomendamos ativar a localização para uma melhor experiência com o aplicativo...
          console.log("[WARN LOCATION]: Permissão negada");
          return;
        }
  
        const locationReady = await waitForLocation();
  
        if (!locationReady) {
          // Colocar um modal aqui falando que não foi possivel obter a localização do usuário e que é necessário tentar novamente...
          console.log("[ERROR LOCATION]: Não foi possivel obter a localização do usuário")
          return;
        }
  
        subscription = await watchPositionAsync({
          accuracy: LocationAccuracy.High,
          timeInterval: 1000,
          distanceInterval: 2
        }, (response) => {
          setLocation(response);
          setLastUpdate(Date.now());

          if (isFollowing) {
            mapRef.current?.animateCamera({
              center: {
                //latitude: response.coords.latitude,
                //longitude: response.coords.longitude

                /*
                ===================
                VALORES DE PAULISTA
                ===================
                latitude: -7.94009,
                longitude: -34.8723,
                */
               /*
                 Valores fixos apenas em dev, quando for fazer deploy usar as coordenadas reais do usuário
               */
                latitude: -8.0675, /* Centro de recife (Marco Zero) */
                longitude: -34.9167,
              },
              //zoom: 19
            });
          }
        });  
      }
  
      getLocation();
  
      return () => {
        subscription?.remove();
      }
    }, []);
  
    return {
      location,
      mapRef,
      mapReady, setMapReady,
      lastUpdate,
      isFollowing, setIsFollowing
    }
}