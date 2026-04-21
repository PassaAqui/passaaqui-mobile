import { Modal, View, Image, Text, Pressable } from "react-native"

type RouteMode = "driving-car" | "foot-walking" | "cycling-regular";

interface LocomotionModalProp {
  onSelect: (mode: RouteMode) => void;
}

export default function LocomotionModal({ onSelect }: LocomotionModalProp ) {
  return (
    <Modal transparent animationType="fade">
      <View className="flex-1 bg-black/50 items-center justify-center px-6">
        <View className="w-full bg-white items-center justify-center gap-2 p-6 rounded-xl overflow-hidden">
          <Image className="w-24 h-24" source={require("@/assets/user/map/poi/destination.png")} />
          <Text className="font-itim text-3xl">Partiu destino!</Text>
          <Text className="text-center font-itim text-lg">Vamos procurar a melhor rota para você</Text>

          <View className="flex-row gap-3 mt-6">
            <Pressable onPress={() => onSelect("foot-walking")}  className="border border-[#EAAA6A] p-2 px-3 rounded-lg items-center justify-center active:opacity-30">
              <Image className="w-20 h-20 opacity-70" source={require("@/assets/user/map/poi/foot-walking.png")} />
              <Text className="font-itim text-lg text-center">A pé</Text>
            </Pressable>

            <Pressable onPress={() => onSelect("driving-car")}  className="border border-[#EAAA6A] p-2 px-3 rounded-lg items-center justify-center active:opacity-30">
              <Image className="w-20 h-20 opacity-70" source={require("@/assets/user/map/poi/car.png")} />
              <Text className="font-itim text-lg text-center">Carro</Text>
            </Pressable>

            <Pressable onPress={() => onSelect("cycling-regular")}  className="border border-[#EAAA6A] p-2 px-3 rounded-lg items-center justify-center active:opacity-30">
              <Image className="w-20 h-20 opacity-70" source={require("@/assets/user/map/poi/bike.png")} />
              <Text className="font-itim text-lg text-center">Bicicleta</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}