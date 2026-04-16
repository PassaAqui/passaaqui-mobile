import { View, Image } from "react-native";

export default function LogoIcon() {
  return (
    <View>
      <Image className="w-40 h-40" source={require("@/assets/logo/logo.png")} />
    </View>
  )
}