import { View, Image, Text, Pressable, Modal } from "react-native"

interface SimulationAlertModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function SimulationAlertModal({ visible, onClose }: SimulationAlertModalProps) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={() => {}}>
      <View className="flex-1 bg-black/50 items-center justify-center px-6">
        <View className="w-full bg-white p-6 items-center justify-center gap-3 rounded-xl">
          <Image className="w-24 h-24" source={require("@/assets/user/map/alert.png")} />
          <Text className="font-itim text-3xl text-yellow-500">ATENÇÃO!</Text>

          <Text className="text-center font-itim text-base leading-6">Nesta versão, o app possui o botão “Simular rota”, que permite percorrer o trajeto até o POI escolhido mesmo que você esteja parado. Ele existe para demonstrar o funcionamento completo do app (rotas, chegada ao destino e ganho de XP) sem precisar se deslocar na vida real. Na versão oficial, essa simulação será removida e o app utilizará somente o seu GPS real.</Text>

          <Pressable onPress={onClose} className="bg-[#EAAA6A] w-full p-4 items-center justify-center rounded-lg active:opacity-65">
            <Text className="text-xl font-itim text-center">Entendido</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}
