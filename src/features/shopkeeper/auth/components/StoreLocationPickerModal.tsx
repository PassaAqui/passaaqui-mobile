import { Modal, View, Text, Pressable } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";
import { Map, Camera, Marker } from "@maplibre/maplibre-react-native";
import type { NativeSyntheticEvent } from "react-native";
import { MIN_DISTANCE_METERS, distanceInMeters } from "@/src/features/shopkeeper/auth/utils/distanceInMeters";
import { MARCO_ZERO_RECIFE, fromLngLat, toLngLat, type LatLng } from "@/src/constants/user/map/coordinates";

export interface ExistingPoi {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
}

interface StoreLocationPickerModalProps {
  visible: boolean;
  existingPois: ExistingPoi[];
  initialLocation?: { latitude: number; longitude: number };
  onConfirm: (location: { latitude: number; longitude: number }) => void;
  onClose: () => void;
}

export default function StoreLocationPickerModal({ visible, existingPois, initialLocation, onConfirm, onClose }: StoreLocationPickerModalProps) {
  const insets = useSafeAreaInsets();
  
  const [pin, setPin] = useState<LatLng | null>(initialLocation ?? null);
  const [blocked, setBlocked] = useState(false);

  const handleMapPress = (event: NativeSyntheticEvent<{ lngLat: [number, number] }>) => {
    // MapLibre retorna lngLat como [longitude, latitude]
    const coordinate = fromLngLat(event.nativeEvent.lngLat);
    console.log("[StoreLocationPickerModal] coordenada marcada:", coordinate);

    const tooClose = existingPois.some(
      (poi) => distanceInMeters(coordinate, poi) < MIN_DISTANCE_METERS
    );

    setPin(coordinate);
    setBlocked(tooClose);
  };

  const handleConfirm = () => {
    if (!pin || blocked) return;
    console.log("[StoreLocationPickerModal] localização confirmada:", pin);
    onConfirm(pin);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView edges={["top", "bottom"]} className="flex-1">
        <View className="flex-row justify-between items-center p-4" style={{ paddingTop: insets.top }}>
          <Text className="font-interBold text-base">Marque a localização da sua loja</Text>
          <Pressable onPress={onClose}>
            <Text className="text-cyan-600 font-inter">Fechar</Text>
          </Pressable>
        </View>

        <Map
          mapStyle="https://demotiles.maplibre.org/style.json"
          style={{ flex: 1 }}
          onPress={handleMapPress}
        >
          <Camera
            initialViewState={{
              center: toLngLat(initialLocation ?? MARCO_ZERO_RECIFE),
              zoom: 14,
            }}
          />

          {existingPois.map((poi) => (
            <Marker
              key={poi.id}
              id={`existing-poi-${poi.id}`}
              lngLat={toLngLat({ latitude: poi.latitude, longitude: poi.longitude })}
            >
              <View style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: "gray",
                borderWidth: 2,
                borderColor: "white",
              }} />
            </Marker>
          ))}

          {pin && (
            <Marker
              id="selected-pin"
              lngLat={toLngLat(pin)}
            >
              <View style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: blocked ? "red" : "#EAAA6A",
                borderWidth: 2,
                borderColor: "white",
              }} />
            </Marker>
          )}
        </Map>

        {blocked && (
          <Text className="text-red-500 text-center font-itim p-2">
            Esse ponto está muito próximo de outra loja já cadastrada. Escolha um local diferente.
          </Text>
        )}

        <Pressable
          onPress={handleConfirm}
          disabled={!pin || blocked}
          className={`m-4 p-4 items-center rounded-xl ${!pin || blocked ? "bg-gray-300" : "bg-[#EAAA6A]"}`}
        >
          <Text className="font-interBold">Confirmar localização</Text>
        </Pressable>
      </SafeAreaView>
    </Modal>
  )
}
