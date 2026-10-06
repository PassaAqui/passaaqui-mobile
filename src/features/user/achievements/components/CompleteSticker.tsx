import { Pressable, Image, Text } from "react-native";
import { useState } from "react";
import StickerDetail from "@/src/features/user/achievements/components/StickerDetail";
import { Achievement } from "@/src/features/user/achievements/services/achievementService";

const NO_IMAGE = require("@/assets/user/achievements/without-sticker.png");

interface CompleteStickerProps {
  achievement: Achievement,
  invertRotate: boolean,
}

export default function CompleteSticker({ achievement, invertRotate }: CompleteStickerProps) {
  const [showStickerDetailModal, setShowStickerDetailModal] = useState<boolean>(false);

  return (
    <>
      <Pressable testID="sticker-card" onPress={() => setShowStickerDetailModal(true)} className={`gap-2 border border-gray-400 rounded-xl items-center justify-center overflow-hidden h-48 w-[47%] pb-6 active:opacity-55 ${invertRotate ? '-rotate-2' : 'rotate-2'}`}>
        <Image testID="sticker-image" className="bg-gray-400 w-full h-40" source={achievement.photoUrl ? { uri: achievement.photoUrl } : NO_IMAGE} />
        <Text className="font-interBold text-lg text-center">{achievement.name}</Text>
      </Pressable>

      <StickerDetail achievement={achievement} visible={showStickerDetailModal} onClose={() => setShowStickerDetailModal(false)} />
    </>
  )
}
