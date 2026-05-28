import { View, Pressable, Image } from "react-native"

export default function Header(){
  return (
    <View className="bg-white flex-row items-center justify-between p-2 px-6">
      <Pressable className="active:opacity-35">
        <Image source={require("@/assets/user/settings/back.png")} />
      </Pressable>

      <Image className="w-10 h-10" source={require("@/assets/logo/logoOFC.png")} />
    </View>
  )
}