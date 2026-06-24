import { Pressable, Image, Text,  } from "react-native"

interface CompleteStickerProps {
  image: string,
  title: string,
  invertRotate: boolean
}

export default function CompleteSticker({ image, title, invertRotate }: CompleteStickerProps) {
  return (
    <Pressable className={`gap-2 border border-gray-400 rounded-xl items-center justify-center overflow-hidden h-48 w-[47%] pb-6 active:opacity-55 ${invertRotate ? '-rotate-2' : 'rotate-2'}`}>
      <Image className="bg-gray-400 w-full h-40" source={{ uri: image }} />
      <Text className="font-interBold text-lg text-center">{title}</Text>
    </Pressable>
  )
}