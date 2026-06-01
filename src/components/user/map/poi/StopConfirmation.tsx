import { View, Image, Text, Pressable, Modal } from "react-native"

interface StopConfirmationProp {
  visible: boolean;
  onStop: () => void;
}

export default function StopConfirmation({ visible,  onStop }: StopConfirmationProp) {
  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onStop}>
      <View className="flex-1 bg-black/50 items-center justify-center px-6">
        <View className="w-full bg-white p-6 items-center justify-center gap-3 rounded-xl">
          <Image className="w-24 h-24" source={require("@/assets/user/map/alert.png")} />
          <Text className="font-itim text-3xl text-red-500">ATENÇÂO!</Text>
            
          <Text className="text-center font-itim text-lg">Você tem certeza que deseja cancelar essa viagem?</Text>
          <Pressable onPress={onStop} className="bg-red-400 w-full p-4 items-center justify-center rounded-lg active:opacity-45">
            <Text className="text-xl font-itim text-center text-white">Confirmar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}