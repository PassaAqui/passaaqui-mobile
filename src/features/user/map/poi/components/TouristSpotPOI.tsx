import { Modal, View, Text, Image, Pressable, ImageSourcePropType } from "react-native";
import { useState } from "react";
import LocomotionModal from "@/src/features/user/map/poi/components/LocomotionMode";

type RouteMode = "driving-car" | "foot-walking" | "cycling-regular";

interface TouristPOIModalProps {
  img: ImageSourcePropType
  title: string,
  description: string,
  distance: number | string | null,
  xpQuantity: number
  visible: boolean,
  onClose: () => void,
  onNavigate: (mode: RouteMode) => void;
}

export default function TouristSpotPOI({ img, title, description, distance, xpQuantity, visible, onClose, onNavigate }: TouristPOIModalProps) {
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
      <Pressable onPress={onClose} className="flex-1 bg-black/50 items-center justify-center px-6">
        <Pressable onPress={() => {}} className="w-full bg-white items-center justify-center gap-4 rounded-xl overflow-hidden">
          <Pressable onPress={onClose} className="absolute z-10 top-4 right-4 bg-white/50 p-3 rounded-full w-12 h-12 items-center justify-center active:opacity-30">
            <Text className="font-interBold text-xl text-center" numberOfLines={1}>X</Text>
          </Pressable>
          <Image className="bg-gray-200 w-full h-56" resizeMode="cover" source={img} />

          <View className="w-full px-6 pb-6 gap-4 items-center">
            <Text className="font-itim text-3xl text-center" adjustsFontSizeToFit>{title}</Text>

            <View className="h-px w-3/5 bg-black" />

            <Text className="font-itim text-center">{description}</Text>

            <View className="flex-row gap-8">
              <View className="border border-[#EAAA6A] p-4 w-2/5 rounded-lg items-center justify-center">
                <Image className="w-10 h-10 opacity-70" source={require("@/assets/user/map/poi/distance.png")} />
                <Text className="font-itim text-lg opacity-70">Distância</Text>
                <Text className="font-itim text-3xl">{distance}</Text>
              </View>

              <View className="border border-[#EAAA6A] p-4 w-2/5 rounded-lg items-center justify-center">
                <Image className="w-10 h-10 opacity-70" source={require("@/assets/user/map/poi/xp.png")} />
                <Text className="font-itim text-lg opacity-70">Recompensa</Text>
                <Text className="font-itim text-3xl">{xpQuantity} <Text className="text-center text-xl font-itim">XP</Text></Text>
              </View>
            </View>

            <Pressable onPress={() => setOpenLocomotionModal(true)} className="bg-[#EAAA6A] w-full p-4 items-center justify-center rounded-lg active:opacity-65">
              <Text className="font-itim text-xl text-center">Ir agora</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}