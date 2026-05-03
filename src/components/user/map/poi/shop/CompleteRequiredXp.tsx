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

      {showText && currentXp >= requiredXp && (
        <Text className="text-green-600 text-base flex-1">XP suficiente para resgatar!</Text>
      )}

      {showText && currentXp < requiredXp && (
        <View className="flex-row justify-between items-center gap-2">
          <Image className="w-4 h-4" source={require("@/assets/user/map/poi/shop/cant-rescue.png")} />
          <Text className="text-red-500 text-base flex-1">XP insuficiente</Text>
          <Text className="text-black opacity-55">Faltam {requiredXp - currentXp} XP</Text>
        </View>
      )}
    </View>
  )
}