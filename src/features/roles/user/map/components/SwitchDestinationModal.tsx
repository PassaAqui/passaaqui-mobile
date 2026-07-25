import { View, Image, Text, Pressable, Modal } from "react-native"

interface StopRouteModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onClose: () => void
}

export default function SwitchDestinationModal({ visible, onConfirm, onCancel, onClose }: StopRouteModalProps) {
  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <Pressable onPress={onClose} className="flex-1 bg-black/50 items-center justify-center px-6">
        <Pressable onPress={() => {}} className="w-full bg-white p-6 items-center justify-center gap-3 rounded-xl">
          <Image className="w-24 h-24" source={require("@/assets/user/map/alert.png")} />
          <Text className="font-itim text-3xl text-red-500">ATENÇÂO!</Text>
            
          <Text className="text-center font-itim text-lg">Você já estava com um destino traçado. Desejas encerrá-lo?</Text>

          <View className="w-full flex-row gap-3 items-center justify-center">
            <Pressable onPress={onConfirm} className="bg-red-400 px-10 py-4 items-center justify-center rounded-lg active:opacity-45">
              <Text className="text-xl font-itim text-center text-white">Confirmar</Text>
            </Pressable>
            <Pressable onPress={onCancel} className="bg-gray-300 px-10 py-4 items-center justify-center rounded-lg active:opacity-45">
              <Text className="text-xl font-itim text-center text-black">Cancelar</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}