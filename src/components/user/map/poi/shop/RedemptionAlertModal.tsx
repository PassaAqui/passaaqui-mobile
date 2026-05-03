import { Modal, View, Text, Image, Pressable } from "react-native";

interface RedemptionAlertModalProps {
  visible: boolean
}

export default function RedemptionAlertModal({ visible }: RedemptionAlertModalProps) {
  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View className="flex-1 bg-black/40 items-center justify-center px-6">
        <View className="w-full bg-white px-6 p-4 items-center justify-center gap-2 rounded-2xl border-2 border-[#EAAA6A]">
          <View className="items-center justify-center gap-0">
            <Image className="w-28 h-28" source={require("@/assets/user/map/poi/shop/clock2.png")} />
            <Text className="font-itim text-3xl text-black text-center">Resgate Pendente</Text>
          </View>
            
          <Text className="text-center font-itim text-lg opacity-75 ">Você já possui um código ativo. Utilize-o para realizar outra compra!</Text>
          <View>
            <Pressable className="bg-[#3D2408] px-10 p-1 items-center justify-center rounded-2xl active:opacity-65">
              <Text className="text-xl font-itim text-center text-white">Ver me código</Text>
            </Pressable>

            <Pressable className="bg-transparent px-10 p-1 items-center justify-center rounded-2xl active:opacity-65">
              <Text className="text-xl font-itim text-center text-black">Agora não</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )  
}