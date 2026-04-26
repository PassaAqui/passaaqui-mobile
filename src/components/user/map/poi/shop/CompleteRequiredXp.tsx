import { View, Image } from "react-native"

interface CompleteRequiredXpProps {
  currentXp: number,
  requiredXp: number
}

export default function CompleteRequiredXp({ currentXp, requiredXp }: CompleteRequiredXpProps) {
  return (
    <View>
      {currentXp >= requiredXp && (
        <Image className="w-4 h-4" source={require("@/assets/user/map/poi/shop/check.png")} />
      )}
    </View>
  )
}