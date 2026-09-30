import { router } from "expo-router";
import { View, Pressable, Image, Text } from "react-native";

export default function SettingsHeader({ title }: { title: string }) {
  return (
    <View className="absolute top-0 left-0 right-0 items-center justify-center p-10 z-10 flex-row">
      <Pressable onPress={() => router.back()} className="absolute left-7 active:opacity-35">
        <Image source={require("@/assets/user/settings/back.png")} />
      </Pressable>
      <Text className="font-itim text-black text-3xl">{title}</Text>
    </View>
  )
}