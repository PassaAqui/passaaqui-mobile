import { View, Image, Text } from "react-native"

interface CompleteRequiredXpProps {
  currentXp: number,
  requiredXp: number,
  showText: boolean
}

export default function CompleteRequiredXp({ currentXp, requiredXp, showText }: CompleteRequiredXpProps) {
  return (
    <View className="flex-row items-center gap-2">
      {currentXp >= requiredXp && (
        <Image className="w-4 h-4" source={require("@/assets/user/map/poi/shop/check.png")} />
      )}

      {showText && (
        <Text className="text-green-600 text-base">XP suficiente para resgatar!</Text>
      )}
    </View>
  )
}