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
import SwitchDestinationModal from "@/src/features/user/map/components/SwitchDestinationModal";
import StopConfirmation from "@/src/features/user/map/poi/components/StopConfirmation";
import { useMapScreen } from "@/src/features/user/map/hooks/useMapScreen";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import GpsDisabledModal from "@/src/features/user/map/components/GpsDisabledModal";
import AnimatedPostcardModal from "@/src/features/user/map/postcard/components/AnimatedPostcardModal";
import { useTouristMe } from "@/src/features/user/auth/hooks/useTouristMe";
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
    setOpenTouristPOIMarker, openTouristPOIMarker,
    setOpenShopPOIMarker, openShopPOIMarker,
    setOpenPOIMarker,
    touristPois, shopPois,
    routeCoords,
    stop,
    showAlertModal, setShowAlertModal,
    handleNavigation,
    setShowStopConfirmation, showStopConfirmation,
    handleStopNavigation,
    showSwitchDestinationModal,
    confirmSwitchDestination,
    cancelSwitchDestination,
    cityToShow, dismissCity, loadingCity
  } = useMapScreen();

  const { data: user } = useTouristMe();

  const handleFollow = () => {
    setIsFollowing(true);

    if (location) {
      mapRef.current?.animateToRegion({
          //latitude: response.coords.latitude,
          //longitude: response.coords.longitude

          /*
            Valores fixos apenas em dev, quando for fazer deploy usar as coordenadas reais do usuário
          */
          latitude: -8.0675,
          longitude: -34.9167,
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
          <Text className="font-itim text-xl">{user?.name ?? "..."}</Text>
          <Text>{user?.currentXP ?? 0} XP</Text>
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
                latitude: -8.0675, /* Centro de recife (Marco Zero) */
                longitude: -34.9167,
                /* PAULISTA
                latitude: -7.94009,
                longitude: -34.8723
                */
                //latitude: -8.2832, Caruaru
                //longitude: -35.9736
              }}
              icon={require("@/assets/user/map/user-pin.png")}
            />

            {touristPois.map(touristPoi => (
              <Marker
                key={touristPoi.id}
                coordinate={{
                  latitude: touristPoi.latitude,
                  longitude: touristPoi.longitude
                }}
                title={touristPoi.name}
                onPress={() => {
                  setOpenTouristPOIMarker(touristPoi);
                  setOpenPOIMarker(touristPoi);
                }}
                icon={require("@/assets/user/map/poi/touristPOI.png")}
              />
            ))}

            {shopPois.map(shopPoi => (
              <Marker
                key={shopPoi.id}
                coordinate={{
                  latitude: shopPoi.latitude,
                  longitude: shopPoi.longitude
                }}
                title={shopPoi.name}
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

      <AnimatedPostcardModal
        visible={!!cityToShow}
        onClose={dismissCity}
        cityImage={cityToShow?.cityImage ?? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtw1VcVbFpdwzwS_EnyK5YHMkTqcyLZwmBZ_f8Pj70vw&s=10"}
        cityName={cityToShow?.cityName ?? ""}
        chronicle={cityToShow?.chronicle ?? "Recife nasceu entre rios, pontes e o mar, aprendendo desde cedo a conviver com diferentes povos e culturas. Suas ruas guardam lembranças da ocupação holandesa, das lutas pela liberdade e do crescimento de uma cidade que nunca deixou de se reinventar"}
      />

      {showAlertModal && (
        <OutsideRegionModal visible={showAlertModal} onClose={() => setShowAlertModal(false)} />
      )}

      {openTouristPOIMarker && (
        <TouristSpotPOI
          img={require("@/assets/user/map/tmp/no-image.png")}
          title={openTouristPOIMarker.name}
          description={openTouristPOIMarker.description ?? ""}
          distance={openTouristPOIMarker.distanceLabel}
          xpQuantity={openTouristPOIMarker.xpReward ?? 0}
          visible={!!openTouristPOIMarker}
          onClose={() => setOpenTouristPOIMarker(null)}
          onNavigate={(mode) => handleNavigation({ latitude: openTouristPOIMarker.latitude, longitude: openTouristPOIMarker.longitude }, mode, openTouristPOIMarker.id)}
        />
      )}

      {openShopPOIMarker && (
        <ShopkeeperPOI
          img={require("@/assets/user/map/tmp/no-image.png")}
          title={openShopPOIMarker.name}
          description={openShopPOIMarker.description ?? "Sem descrição"}
          distance={openShopPOIMarker.distanceLabel}
          starQuantity={openShopPOIMarker.averageRating ?? 0}
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
          onClose={() => {
            setShowStopConfirmation(false)
          }}
        />
      )}

      {showSwitchDestinationModal && (
        <SwitchDestinationModal
          visible={showSwitchDestinationModal}
          onConfirm={confirmSwitchDestination}
          onCancel={cancelSwitchDestination}
          onClose={cancelSwitchDestination}
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
