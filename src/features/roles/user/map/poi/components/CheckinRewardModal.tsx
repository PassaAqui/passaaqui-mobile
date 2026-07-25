import { Modal, View, Image, Text, Pressable } from "react-native"

interface CheckinRewardModalProps {
  visible: boolean;
  xpEarned: number;
  onClose: () => void;
}

export default function CheckinRewardModal({ visible, xpEarned, onClose }: CheckinRewardModalProps) {
  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <Pressable onPress={onClose} className="flex-1 bg-black/50 items-center justify-center px-6">
        <View  className="w-full bg-white p-6 items-center justify-center gap-2 rounded-xl">
          <Image className="w-28 h-28 mb-3" source={require("@/assets/user/map/poi/arrived.png")} />
          <Text className="font-interBold text-2xl text-center w-full">Novo lugar descoberto!</Text>

          <Text className="text-center font-inter text-base">Você chegou ao destino e ganhou</Text>

          <Text className="font-interBold text-3xl text-[#EAAA6A]">+{xpEarned} XP</Text>

          <Pressable onPress={onClose} className="w-full bg-[#EAAA6A] px-10 py-4 items-center justify-center rounded-lg active:opacity-45 mt-3">
            <Text className="text-lg font-interBold text-center text-white">Fechar</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  )
}