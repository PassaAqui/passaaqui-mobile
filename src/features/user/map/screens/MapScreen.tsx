import { StyleSheet, View, Text, Image, ActivityIndicator } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { StatusBar } from "expo-status-bar";
import { mapStyle } from "@/src/constants/user/map/map";
import { touristPOIs, shopPOIs } from "@/src/constants/user/map/poi";
import OutsideRegionModal from "@/src/features/user/map/components/OutsideRegionModal";
import TouristSpotPOI from "@/src/features/user/map/poi/components/TouristSpotPOI";
import ShopkeeperPOI from "@/src/features/user/map/poi/components/ShopkeeperPOI";
import StopButton from "@/src/features/user/map/components/StopButton";
import FollowUserButton from "@/src/features/user/map/components/FollowUserButton";
import StopConfirmation from "@/src/features/user/map/poi/components/StopConfirmation";
import { useMapScreen } from "@/src/features/user/map/hooks/useMapScreen";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import GpsDisabledModal from "@/src/features/user/map/components/GpsDisabledModal";
/* latitude: -8.0675
longitude: -34.9167 */ // Meio de Recife (Marco Zero)
export default function MapScreen() {
  const insets = useSafeAreaInsets();

  const {
    location,
    loadingRoute,
    mapRef,
    mapReady,
    setMapReady,
    gpsActive,
    isFollowing, setIsFollowing,
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
    handleStopNavigation,
    routeDistance
  } = useMapScreen();

  const handleFollow = () => {
    setIsFollowing(true);

    if (location) {
      mapRef.current?.animateToRegion({
          //latitude: response.coords.latitude,
          //longitude: response.coords.longitude

          /*
            Valores fixos apenas em dev, quando for fazer deploy usar as coordenadas reais do usuário
          */
          latitude: -7.94009,
          longitude: -34.8723,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
      });
    }
  };

  return (      
    <SafeAreaView edges={["top"]} className="bg-white flex-1 justify-center">
      <StatusBar style="dark" hidden/>

      <View style={{ paddingTop: insets.top }} className="flex-row px-4 pb-4 items-center gap-3 bg-white">
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

      <MapView
        ref={mapRef}
        customMapStyle={mapStyle}
        initialRegion={{
          latitude: -8.0675, /* Centro de recife (Marco Zero) */
          longitude: -34.9167,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
        style={styles.map}
        onMapReady={() => setMapReady(true)}
        onRegionChange={(region, details) => {
          if (details.isGesture) {
            setIsFollowing(false);
          }
        }}
      >
        {location && (
          <>
            <Marker
              coordinate={{
                latitude: -7.94009,
                longitude: -34.8723
                //latitude: -8.2832, Caruaru
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
          </>
        )}
      </MapView>

      {showAlertModal && (
        <OutsideRegionModal visible={showAlertModal} onClose={() => setShowAlertModal(false)} />
      )}

      {openTouristPOIMarker && (
        <TouristSpotPOI
          img={require("@/assets/user/map/tmp/no-image.png")}
          title={openTouristPOIMarker.title}
          description={openTouristPOIMarker.description}
          distance={routeDistance}
          xpQuantity={openTouristPOIMarker.xpQuantity}
          visible={!!openTouristPOIMarker}
          onClose={() => setOpenTouristPOIMarker(null)}
          onNavigate={(mode) => handleNavigation({ latitude: openTouristPOIMarker.latitude, longitude: openTouristPOIMarker.longitude }, mode, openTouristPOIMarker.id)}
        />
      )}

      {openShopPOIMarker && (
        <ShopkeeperPOI
          img={require("@/assets/user/map/tmp/no-image.png")}
          title={openShopPOIMarker.title}
          description={openShopPOIMarker.description}
          distance={routeDistance}
          starQuantity={openShopPOIMarker.xpQuantity}
          visible={!!openShopPOIMarker}
          onClose={() => setOpenShopPOIMarker(null)}
          onNavigate={(mode) => handleNavigation({ latitude: openShopPOIMarker.latitude, longitude: openShopPOIMarker.longitude }, mode, openShopPOIMarker.id)}
        />
      )}

      {(stop || !isFollowing) && (
        <View className="absolute bottom-5 left-0 right-0 px-4">
          <View className={`flex-row justify-center gap-3 ${stop && !isFollowing ? '' : 'justify-center'}`}>
            {stop && <StopButton onConfirmate={() => setShowStopConfirmation(true)} />}
            {!isFollowing && <FollowUserButton onFollow={handleFollow} />}
          </View>
        </View>
      )}

      {showStopConfirmation && (
        <StopConfirmation
          visible={!!showStopConfirmation}
          onStop={handleStopNavigation}
        />
      )}

      {!gpsActive && (
        <GpsDisabledModal />
      )}
    </SafeAreaView>
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
