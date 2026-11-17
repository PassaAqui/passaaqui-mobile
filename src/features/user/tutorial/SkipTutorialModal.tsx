import { Modal, Pressable, Text, View } from "react-native";

interface SkipTutorialModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function SkipTutorialModal({ visible, onCancel, onConfirm }: SkipTutorialModalProps) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <View className="flex-1 items-center justify-center bg-black/45 px-5">
        <View className="w-full max-w-[420px] rounded-2xl bg-white p-6">
          <Text className="font-itim text-3xl text-[#3D2408]">Pular o tutorial?</Text>
          <Text className="mt-2 font-inter text-base leading-6 text-[#3D2408]">
            Você pode explorar por conta própria e rever o tutorial depois em Configurações.
          </Text>
          <View className="mt-6 flex-row gap-3">
            <Pressable onPress={onCancel} className="min-h-[48px] flex-1 items-center justify-center rounded-lg border border-[#EAAA6A] px-3">
              <Text className="font-interBold text-base text-[#A86830]">Continuar</Text>
            </Pressable>
            <Pressable onPress={onConfirm} className="min-h-[48px] flex-1 items-center justify-center rounded-lg bg-[#EAAA6A] px-3">
              <Text className="font-interBold text-base text-white">Pular tutorial</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
