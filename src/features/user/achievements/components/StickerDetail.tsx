import { Modal, View, Text, Image, Pressable, ScrollView } from "react-native";
import { Achievement } from "@/src/features/user/achievements/services/achievementService";
import { formatDateBR } from "@/src/features/user/purchased/utils/formatDate";

const NO_IMAGE = require("@/assets/user/achievements/without-sticker.png");
const EMPTY_FIELD = "—";

interface StickerDetailProps {
  achievement: Achievement,
  visible?: boolean,
  onClose?: () => void
}

export default function StickerDetail({ achievement, visible, onClose }: StickerDetailProps) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <Pressable onPress={onClose} className="flex-1 bg-black/25 items-center justify-center px-6">
        <Pressable onPress={() => {}} className="w-full max-h-[90%] bg-[#F4F1EA] rounded-xl overflow-hidden shadow-lg shadow-black">
          <ScrollView showsVerticalScrollIndicator={false} className="bg-[#F4F1EA] rounded-xl" contentContainerStyle={{ overflow: 'hidden' }}>
            <Pressable onPress={onClose} className="pt-3 pl-3 self-start active:opacity-30">
              <Text className="font-inter text-lg text-start">← Voltar</Text>
            </Pressable>
            <Image className="bg-gray-200 w-full h-56 my-4" resizeMode="cover" source={achievement.photoUrl ? { uri: achievement.photoUrl } : NO_IMAGE} />

            <View className="w-full px-6 pb-6 gap-4 items-center">
              <Text className="font-interBold text-3xl text-center" adjustsFontSizeToFit>{achievement.name}</Text>
              <Text className="font-interItalic text-center w-5/6 text-black/65">{achievement.description}</Text>

              <View className="flex flex-col border-2 border-dashed w-full p-4 border-gray-400/80 rounded-lg my-5">
                <View className="flex-row">
                  <Text className="flex-1">Origem:</Text>
                  <Text>{achievement.location ?? EMPTY_FIELD}</Text>
                </View>
                <View className="flex-row">
                  <Text className="flex-1">Data:</Text>
                  <Text>{formatDateBR(achievement.unlockedAt) || EMPTY_FIELD}</Text>
                </View>
                <View className="flex-row">
                  <Text className="flex-1">POI:</Text>
                  <Text>{achievement.poiName ?? EMPTY_FIELD}</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  )
}
