import { Modal, View, Text, Image, Pressable, ImageSourcePropType } from "react-native";
import { useState } from "react";
import LocomotionModal from "./LocomotionModal";

type RouteMode = "driving-car" | "foot-walking" | "cycling-regular";

interface POIModalProps {
  img: ImageSourcePropType
  title: string,
  description: string,
  distance: number | string | null,
  xpQuantity: number
  visible: boolean,
  onClose: () => void,
  onNavigate: (mode: RouteMode) => void;
}

export default function POIModal({ img, title, description, distance, xpQuantity, visible, onClose, onNavigate }: POIModalProps) {
  const [openLocomotionModal, setOpenLocomotionModal] = useState(false);

  if (openLocomotionModal) {
    return (
      <LocomotionModal
        onSelect={(mode) => {
          onNavigate(mode);
          setOpenLocomotionModal(false);
          onClose();
        }}
      />
    )
  }

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 items-center justify-center px-6">
        <View className="w-full bg-white items-center justify-center gap-4 rounded-xl overflow-hidden">
          <Image className="bg-gray-200 w-full h-56" resizeMode="cover" source={img} />

          <View className="w-full px-6 pb-6 gap-4 items-center">
            <Text className="font-irishGrover text-3xl text-center" adjustsFontSizeToFit>{title}</Text>
            <Text className="font-itim text-center">{description}</Text>

            <View className="flex-row gap-8">
              <View className="bg-[#F0F0F0] p-4 w-1/3 rounded-lg items-center justify-center">
                <Text className="font-itim text-3xl">{distance}</Text>
                <Text className="font-itim text-lg">Distância</Text>
              </View>

              <View className="bg-[#F0F0F0] p-5 w-1/3 rounded-lg items-center justify-center">
                <Text className="font-itim text-3xl">{xpQuantity}</Text>
                <Text className="font-itim text-lg">XP</Text>
              </View>
            </View>

            {/*<Pressable
              onPress={() => {
                onNavigate();
                onClose();
              }}
              className="bg-[#EAAA6A] w-full p-4 items-center justify-center rounded-lg active:opacity-65"
            >*/}
            <Pressable onPress={() => setOpenLocomotionModal(true)} className="bg-[#EAAA6A] w-full p-4 items-center justify-center rounded-lg active:opacity-65">
              <Text className="font-itim text-xxl">Ir</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}