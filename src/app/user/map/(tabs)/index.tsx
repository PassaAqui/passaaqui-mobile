import { StyleSheet, View, Text, Image } from "react-native";
import { requestForegroundPermissionsAsync, getCurrentPositionAsync, LocationObject, watchPositionAsync, LocationAccuracy } from "expo-location";
import MapView, { Marker } from "react-native-maps";
import { useEffect, useState, useRef } from "react";
import AlertModal from "@/src/components/user/map/Alert";

const PAULISTA_BOUNDS ={
  latitudeMin: -7.9812503,
  latitudeMax: -7.8379686,
  longitudeMin: -35.0310089,
  longitudeMax: -34.8192091
}

const mapStyle = [
  {
    "featureType": "poi",
    "stylers": [{ "visibility": "off" }]
  },
  {
    "featureType": "poi.park",
    "stylers": [{ "visibility": "on" }]
  },
  {
    "featureType": "road",
    "elementType": "labels",
    "stylers": [{ "visibility": "off" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{ "visibility": "on" }]
  },
  {
    "featureType": "water",
    "stylers": [{ "color": "#a0d2ff" }]
  }
];

export default function Index() {
  const [location, setLocation] = useState<LocationObject | null>(null);
  const mapRef = useRef<MapView>(null);
  const [showAlertModal, setShowAlertModal] = useState<boolean>(false);
  
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
              latitude: response.coords.latitude,
              longitude: response.coords.longitude
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
    -8.2832 >= PAULISTA_BOUNDS.latitudeMin &&
    -8.2832 <= PAULISTA_BOUNDS.latitudeMax;

    const longitudeDentroDoLimite =
      location.coords.longitude >= PAULISTA_BOUNDS.longitudeMin &&
      location.coords.longitude <= PAULISTA_BOUNDS.longitudeMax;

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


  return (      
    <View className="flex-1 justify-center">
      <View className="flex-row p-4 pt-12 items-center gap-3 bg-white">
        <Image className="w-16 h-16 rounded-full" source={require("@/assets/logo/logoOFC.png")} />
        <View className="flex-col">
          <Text className="font-itim text-xl">David Cleyton</Text>
          <Text>1207 XP</Text>
        </View>
      </View>

      {location && (
        <MapView
          ref={mapRef}
          customMapStyle={mapStyle}
          initialRegion={{
            latitude: -7.94009, // Paulista (PE)
            longitude: -34.8723,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
          style={styles.map}
        >
          <Marker
            coordinate={{
              //latitude: -7.9158,
              //longitude: -34.8587
              latitude: -8.2832,
              longitude: -35.9736
            }}
          />
        </MapView>
      )}

      {showAlertModal && (
        <AlertModal visible={showAlertModal} onClose={() => setShowAlertModal(false)} />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
    width: "100%"
  }
})
