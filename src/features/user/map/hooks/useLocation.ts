import { useState, useRef, useEffect } from "react";
import {
  getCurrentPositionAsync,
  LocationObject,
  requestForegroundPermissionsAsync,
  watchPositionAsync,
  LocationAccuracy
} from "expo-location";
import { Camera, type CameraRef, type MapRef } from "@maplibre/maplibre-react-native";
import { MARCO_ZERO_RECIFE, toLngLat } from "@/src/constants/user/map/coordinates";

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

export function useLocation(cameraRef: React.RefObject<CameraRef | null>) {
  const [location, setLocation] = useState<LocationObject | null>(null);
  const mapRef = useRef<MapRef>(null);
  const [mapReady, setMapReady] = useState<boolean>(false);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [initialPosition, setInitialPosition] = useState<boolean>(false);
  const hasUserManuallyDisabledFollow = useRef(false);
  const isFollowingRef = useRef(isFollowing);

  useEffect(() => {
    isFollowingRef.current = isFollowing;
  }, [isFollowing]);

  const enableAutoFollow = () => {
    hasUserManuallyDisabledFollow.current = false;
    setIsFollowing(true);
  };

  const disableAutoFollow = () => {
    hasUserManuallyDisabledFollow.current = true;
    setIsFollowing(false);
  };

  useEffect(() => {
    if (mapReady && !location) {
      cameraRef.current?.jumpTo({
        center: toLngLat(MARCO_ZERO_RECIFE),
        zoom: 15,
      });
    }
  }, [mapReady, location]);

  useEffect(() => {
    if (location && mapReady && !initialPosition && !isFollowing) {
      cameraRef.current?.jumpTo({
        center: toLngLat(MARCO_ZERO_RECIFE),
        zoom: 15,
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

          const userLat = response.coords.latitude;
          const userLng = response.coords.longitude;

          if (!hasUserManuallyDisabledFollow.current && !__DEV__) {
            cameraRef.current?.easeTo({
              center: toLngLat({ latitude: userLat, longitude: userLng }),
            });
          }

          if (isFollowingRef.current) {
            cameraRef.current?.easeTo({
              center: toLngLat({ latitude: userLat, longitude: userLng }),
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
      isFollowing, setIsFollowing,
      enableAutoFollow,
      disableAutoFollow,
    }
}
