import { StyleSheet, View, Text, Image, ActivityIndicator, Pressable } from "react-native";
import { Map, Camera, Marker, GeoJSONSource, Layer, type ViewStateChangeEvent } from "@maplibre/maplibre-react-native";
import type { NativeSyntheticEvent } from "react-native";
import { StatusBar } from "expo-status-bar";
import OutsideRegionModal from "@/src/features/user/map/components/OutsideRegionModal";
import TouristSpotPOI from "@/src/features/user/map/poi/components/TouristSpotPOI";
import ShopkeeperPOI from "@/src/features/user/map/poi/components/ShopkeeperPOI";
import StopButton from "@/src/features/user/map/components/StopButton";
import FollowUserButton from "@/src/features/user/map/components/FollowUserButton";
import SwitchDestinationModal from "@/src/features/user/map/components/SwitchDestinationModal";
import StopConfirmation from "@/src/features/user/map/poi/components/StopConfirmation";
import { useMapScreen } from "@/src/features/user/map/hooks/useMapScreen";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import GpsDisabledModal from "@/src/features/user/map/components/GpsDisabledModal";
import AnimatedPostcardModal from "@/src/features/user/map/postcard/components/AnimatedPostcardModal";
import CheckinRewardModal from "@/src/features/user/map/poi/components/CheckinRewardModal";
import { useTouristMe } from "@/src/features/user/auth/hooks/useTouristMe";
import { MARCO_ZERO_RECIFE, toLngLat, fromLngLat } from "@/src/constants/user/map/coordinates";

// TODO: trocar pela URL do seu provedor de tiles (MapTiler, Stadia, etc.) quando tiver API key
const MAP_STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";

export default function MapScreen() {
  const insets = useSafeAreaInsets();

  const {
    location,
    loadingRoute,
    cameraRef,
    mapRef,
    setMapReady,
    gpsActive,
    isFollowing, setIsFollowing,
    enableAutoFollow,
    disableAutoFollow,
    setMapCenter,
    setLocomotionMode,
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
    cityToShow, dismissCity,
    checkinReward, setCheckinReward,
    simulating, startSimulation, stopSimulation, currentSimPosition // Quando terminar de fazer o teste pra saber se o checkin ta pegando, REMOVER essa linha
  } = useMapScreen();

  const { data: user } = useTouristMe();

  // Apenas em dev pra testar o checkin
  const userMarkerCoordinate = currentSimPosition ?? MARCO_ZERO_RECIFE;


  const handleFollow = () => {
    enableAutoFollow();

    if (location) {
      cameraRef.current?.easeTo({
        center: toLngLat(MARCO_ZERO_RECIFE),
        zoom: 15,
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

      <Map
        ref={mapRef}
        mapStyle={MAP_STYLE_URL}
        style={styles.map}
        onDidFinishLoadingMap={() => setMapReady(true)}
        onRegionDidChange={(event: NativeSyntheticEvent<ViewStateChangeEvent>) => {
          if (event.nativeEvent.userInteraction) {
            const { center } = event.nativeEvent;
            const coord = fromLngLat(center); // center vem como [lng, lat]
            disableAutoFollow();
            setMapCenter(coord);
          }
        }}
      >
        <Camera
          ref={cameraRef}
          initialViewState={{
            center: toLngLat(MARCO_ZERO_RECIFE),
            zoom: 15,
          }}
        />

        {location && (
          <>
            <Marker
              id="user-marker"
              lngLat={toLngLat(userMarkerCoordinate)}
            >
              <Image
                source={require("@/assets/user/map/user-pin.png")}
                style={{ width: 32, height: 32 }}
              />
            </Marker>

            {touristPois.map(touristPoi => (
              <Marker
                key={touristPoi.id}
                id={`tourist-poi-${touristPoi.id}`}
                lngLat={toLngLat({ latitude: touristPoi.latitude, longitude: touristPoi.longitude })}
                onPress={() => {
                  setOpenTouristPOIMarker(touristPoi);
                  setOpenPOIMarker(touristPoi);
                }}
              >
                <Image
                  source={require("@/assets/user/map/poi/touristPOI.png")}
                  style={{ width: 28, height: 28 }}
                />
              </Marker>
            ))}

            {shopPois.map(shopPoi => (
              <Marker
                key={shopPoi.id}
                id={`shopkeeper-poi-${shopPoi.id}`}
                lngLat={toLngLat({ latitude: shopPoi.latitude, longitude: shopPoi.longitude })}
                onPress={() => {
                  setOpenShopPOIMarker(shopPoi);
                  setOpenPOIMarker(shopPoi);
                }}
              >
                <Image
                  source={require("@/assets/user/map/shopkeeper-pin.png")}
                  style={{ width: 28, height: 28 }}
                />
              </Marker>
            ))}

            {routeCoords.length > 0 && stop && (
              <GeoJSONSource
                id="route-source"
                data={{
                  type: "FeatureCollection",
                  features: [
                    {
                      type: "Feature",
                      properties: {},
                      geometry: {
                        type: "LineString",
                        coordinates: routeCoords.map(toLngLat), // Conversão: LatLng[] → [lng, lat][]
                      },
                    },
                  ],
                }}
              >
                <Layer
                  id="route-line"
                  type="line"
                  source="route-source"
                  paint={{
                    "line-color": "#EAAA6A",
                    "line-width": 6,
                  }}
                />
              </GeoJSONSource>
            )}
          </>
        )}
      </Map>

      {__DEV__ && stop && (
        <Pressable
          onPress={simulating ? stopSimulation : startSimulation}
          className="absolute top-20 right-4 bg-red-500 p-3 rounded-full z-20"
        >
          <Text className="text-white text-xs font-interBold">{simulating ? "Parar sim." : "Simular rota"}</Text>
        </Pressable>
      )}

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
          onNavigate={(mode) => {
            setLocomotionMode(mode);
            handleNavigation({ latitude: openTouristPOIMarker.latitude, longitude: openTouristPOIMarker.longitude }, mode, openTouristPOIMarker.id);
          }}
        />
      )}

      {openShopPOIMarker && (
        <ShopkeeperPOI
          poiId={openShopPOIMarker.id}
          img={ (!!openShopPOIMarker.image) ? openShopPOIMarker.image : require("@/assets/user/map/tmp/no-image.png")}
          title={openShopPOIMarker.name}
          description={openShopPOIMarker.description ?? "Sem descrição"}
          distance={openShopPOIMarker.distanceLabel}
          starQuantity={openShopPOIMarker.averageRating ?? 0}
          visible={!!openShopPOIMarker}
          onClose={() => setOpenShopPOIMarker(null)}
          onNavigate={(mode) => {
            setLocomotionMode(mode);
            handleNavigation({ latitude: openShopPOIMarker.latitude, longitude: openShopPOIMarker.longitude }, mode, openShopPOIMarker.id);
          }}
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

      {checkinReward && (
        <CheckinRewardModal
          visible={!!checkinReward}
          xpEarned={checkinReward?.xp ?? 0}
          onClose={() => setCheckinReward(null)}
        />
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
