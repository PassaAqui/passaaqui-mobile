import { StyleSheet, View, Text, Image } from "react-native";
import { requestForegroundPermissionsAsync, getCurrentPositionAsync, LocationObject, watchPositionAsync, LocationAccuracy } from "expo-location";
import MapView, { Marker } from "react-native-maps";
import { useEffect, useState, useRef } from "react";

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
    // colocar um tratamento pra ver se o usuário está em Recife ou não. Se não tiver, aparecer um modal falando que o app só funciona em recife ou algo assim

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


  /*
  useEffect(() => {
    watchPositionAsync({
      accuracy: LocationAccuracy.Highest,
      timeInterval: 1000,
      distanceInterval: 1
    }, (response) => {
      setLocation(response);
      mapRef.current?.animateCamera({
        center: {
          latitude: response.coords.latitude,
          longitude: response.coords.longitude
        },
        zoom: 19,
      });
    });
  }, []);
  */

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
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005
          }}
          style={styles.map}
        >
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude
            }}
          />
        </MapView>
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
