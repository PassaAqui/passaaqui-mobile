import { Pressable, Image, Text } from "react-native";

export default function WithoutSticker() {
  return (
    <Pressable className="border-2 border-dashed border-gray-400/60 rounded-xl items-center justify-center overflow-hidden h-48 w-[47%] pb-3 active:opacity-45">
      <Image className="w-24 h-32 opacity-55" source={require("@/assets/user/achievements/without-sticker.png")} resizeMode="contain" />
      <Text className="font-interBold text-lg text-center">Tapioca real</Text>
      <Text className="text-sm font-inter opacity-65 text-center">Colete para colar</Text>
    </Pressable>
  )
}