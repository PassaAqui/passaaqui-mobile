import { Modal, View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";
import MapView, { Marker, MapPressEvent } from "react-native-maps";

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

const MIN_DISTANCE_METERS = 15;

function distanceInMeters(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) {
  const R = 6371000;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;

  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(h));
}

export default function StoreLocationPickerModal({ visible, existingPois, initialLocation, onConfirm, onClose }: StoreLocationPickerModalProps) {
  const insets = useSafeAreaInsets();
  
  const [pin, setPin] = useState<{ latitude: number; longitude: number } | null>(initialLocation ?? null);
  const [blocked, setBlocked] = useState(false);

  const handleMapPress = (event: MapPressEvent) => {
    const coordinate = event.nativeEvent.coordinate;
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

        <MapView
          style={{ flex: 1 }}
          initialRegion={{
            latitude: initialLocation?.latitude ?? -8.0675,
            longitude: initialLocation?.longitude ?? -34.9167,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          onPress={handleMapPress}
        >
          {existingPois.map((poi) => (
            <Marker
              key={poi.id}
              coordinate={{ latitude: poi.latitude, longitude: poi.longitude }}
              title={poi.name}
              pinColor="gray"
            />
          ))}

          {pin && (
            <Marker
              coordinate={pin}
              pinColor={blocked ? "red" : "#EAAA6A"}
            />
          )}
        </MapView>

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