import { StyleSheet, View } from "react-native";
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

    if (granted) {
      const currentPosition = await getCurrentPositionAsync();
      setLocation(currentPosition);
    }
  }

  useEffect(() => {
    requestLocationPermission();
  }, []);


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


  return (      
    <View className="flex-1 justify-center items-center">
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
