import { View, Pressable, Image } from "react-native";
import { useRouter } from "expo-router";

export default function Header(){
  const router = useRouter();

  return (
    <View className="bg-white flex-row items-center justify-between pt-2 pb-4 px-6 border-b border-gray-200">
      <Pressable onPress={() => router.back()} className="active:opacity-35">
        <Image source={require("@/assets/user/settings/back.png")} />
      </Pressable>

      <Image className="w-10 h-10" source={require("@/assets/logo/logoOFC.png")} />
    </View>
  )
}