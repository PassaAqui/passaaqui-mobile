import { View } from "react-native";

interface XpBarProps {
  currentXp: number,
  xpRequired: number,
  thickness: number
}

export default function XpBar({ currentXp, xpRequired, thickness }: XpBarProps) {
  const progress: number = Math.min(currentXp /xpRequired, 1);

  return (
    <View className={`bg-gray-300 h-${thickness} overflow-hidden rounded-lg`}>
      <View className="bg-green-500 h-full" style={{width: `${progress * 100}%`}} />
    </View>
  )
}