import { StyleSheet, View, Text, Image, ActivityIndicator } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { StatusBar } from "expo-status-bar";
import { mapStyle } from "@/src/constants/user/map/map";
import { touristPOIs, shopPOIs } from "@/src/constants/user/map/poi";
import AlertModal from "@/src/components/user/map/Alert";
import TouristPOIModal from "@/src/components/user/map/poi/TouristPOIModal";
import ShopPOIModal from "@/src/components/user/map/poi/ShopPOIModal";
import StopButton from "@/src/components/user/map/StopButton";
import StopConfirmation from "@/src/components/user/map/poi/StopConfirmation";
import { useMapScreen } from "@/src/hooks/user/map/useMapScreen";

export default function Index() {
  const {
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
  } = useMapScreen();

  return (      
    <View className="flex-1 justify-center">
      <StatusBar style="dark" hidden/>
      <View className="flex-row p-4 pt-12 items-center gap-3 bg-white">
        <Image className="w-16 h-16 rounded-full" source={require("@/assets/logo/logoOFC.png")} />
        <View className="flex-col">
          <Text className="font-itim text-xl">David Cleyton</Text>
          <Text>1207 XP</Text>
        </View>
      </View>

      {loadingRoute && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#EAAA6A" />
        </View>
      )}

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
              latitude: -7.94009,
              longitude: -34.8723
              //latitude: -8.2832,
              //longitude: -35.9736
            }}
            icon={require("@/assets/user/map/user-pin.png")}
          />

          {touristPOIs.map(touristPoi => (
            <Marker
              key={touristPoi.id}
              coordinate={{
                latitude: touristPoi.latitude,
                longitude: touristPoi.longitude
              }}
              title={touristPoi.title}
              onPress={() => {
                setOpenTouristPOIMarker(touristPoi);
                setOpenPOIMarker(touristPoi);
              }}
              icon={require("@/assets/user/map/poi/touristPOI.png")}
            />
          ))}

          {shopPOIs.map(shopPoi => (
            <Marker
              key={shopPoi.id}
              coordinate={{
                latitude: shopPoi.latitude,
                longitude: shopPoi.longitude
              }}
              title={shopPoi.title}
              onPress={() => {
                setOpenShopPOIMarker(shopPoi);
                setOpenPOIMarker(shopPoi);
              }}
              icon={require("@/assets/user/map/shopkeeper-pin.png")}
            />
          ))}

          {routeCoords.length > 0 && stop && (
            <Polyline
              coordinates={routeCoords}
              strokeColor="#EAAA6A"
              strokeWidth={6}
            />
          )}
        </MapView>
      )}

      {showAlertModal && (
        <AlertModal visible={showAlertModal} onClose={() => setShowAlertModal(false)} />
      )}

      {openTouristPOIMarker && (
        <TouristPOIModal
          img={require("@/assets/user/map/tmp/no-image.png")}
          title={openTouristPOIMarker.title}
          description={openTouristPOIMarker.description}
          distance={routeDistance}
          xpQuantity={openTouristPOIMarker.xpQuantity}
          visible={!!openTouristPOIMarker}
          onClose={() => setOpenTouristPOIMarker(null)}
          onNavigate={(mode) => handleNavigation({ latitude: openTouristPOIMarker.latitude, longitude: openTouristPOIMarker.longitude }, mode)}
        />
      )}

      {openShopPOIMarker && (
        <ShopPOIModal
          img={require("@/assets/user/map/tmp/no-image.png")}
          title={openShopPOIMarker.title}
          description={openShopPOIMarker.description}
          distance={routeDistance}
          xpQuantity={openShopPOIMarker.xpQuantity}
          visible={!!openShopPOIMarker}
          onClose={() => setOpenShopPOIMarker(null)}
          onNavigate={(mode) => handleNavigation({ latitude: openShopPOIMarker.latitude, longitude: openShopPOIMarker.longitude }, mode)}
        />
      )}

      {stop && (
        <StopButton onConfirmate={() => setShowStopConfirmation(true)} />
      )}

      {showStopConfirmation && (
        <StopConfirmation
          visible={!!showStopConfirmation}
          onStop={() => {
            setStop(false);
            setRouteCoords([]);
            setShowStopConfirmation(false);
          }}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
    width: "100%"
  },
  loadingOverlay: {
    position: "absolute",
    zIndex: 10,
    top: "50%",
    alignSelf: "center"
  }
})
