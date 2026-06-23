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

  useEffect(() => {
    if (mapReady && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: -8.0675, /* Centro de recife (Marco Zero) */
        longitude: -34.9167,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    }
  }, [mapReady]);

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
          mapRef.current?.animateCamera({
            center: {
              // coloca um if aqui, se for true vai redirecionar a camera pro lugar q o user está
              
              //latitude: response.coords.latitude,
              //longitude: response.coords.longitude
              latitude: -7.94009, // só pra dev pq eu não vou sair na rua testando a localização
              longitude: -34.8723 // só pra dev pq eu não vou sair na rua testando a localização
            },
            //zoom: 19
          });
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
      lastUpdate
    }
}