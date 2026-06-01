import { View, Image, Text, Pressable, Modal } from "react-native"

interface AlertModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AlertModal({ visible,  onClose}: AlertModalProps) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 items-center justify-center px-6">
        <View className="w-full bg-white p-6 items-center justify-center gap-3 rounded-xl">
          <Image className="w-24 h-24" source={require("@/assets/user/map/alert.png")} />
          <Text className="font-itim text-3xl text-yellow-500">ATENÇÂO!</Text>
            
          <Text className="text-center font-itim text-lg">Parece que você está longe de Paulista... Nosso app ainda não chegou aí, tente novamente dentro do município de Paulista</Text>
          <Pressable onPress={onClose} className="bg-[#EAAA6A] w-full p-4 items-center justify-center rounded-lg active:opacity-65">
            <Text className="text-xl font-itim text-center">Entendido</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}