import { View, Pressable, Text } from "react-native"

export default function StopButton() {
  return (
    <View className="absolute bottom-3 self-center w-full items-center">
      <Pressable className="w-1/4 bg-red-500 rounded-lg py-1 items-center justify-center active:opacity-25">
        <Text className="font-itim text-lg text-white text-center" adjustsFontSizeToFit numberOfLines={1}>PARAR</Text>
      </Pressable>
    </View>
  )
}