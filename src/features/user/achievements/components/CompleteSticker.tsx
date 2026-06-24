import { Pressable, Image, Text } from "react-native";
import { useState } from "react";
import StickerDetail from "@/src/features/user/achievements/components/StickerDetail";

interface CompleteStickerProps {
  id: number,
  image: string,
  title: string,
  invertRotate: boolean,
}

export default function CompleteSticker({ id, image, title, invertRotate }: CompleteStickerProps) {
  const [showStickerDetailModal, setShowStickerDetailModal] = useState<boolean>(false);

  return (
    <>
      <Pressable onPress={() => setShowStickerDetailModal(true)} className={`gap-2 border border-gray-400 rounded-xl items-center justify-center overflow-hidden h-48 w-[47%] pb-6 active:opacity-55 ${invertRotate ? '-rotate-2' : 'rotate-2'}`}>
        <Image className="bg-gray-400 w-full h-40" source={{ uri: image }} />
        <Text className="font-interBold text-lg text-center">{title}</Text>
      </Pressable>

      <StickerDetail id={id} visible={showStickerDetailModal} onClose={() => setShowStickerDetailModal(false)} />
    </>
  )
}