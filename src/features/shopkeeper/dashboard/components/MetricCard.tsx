import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface MetricCardProps {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  badge?: string;
}

export function MetricCard({ label, value, icon, badge }: MetricCardProps) {
  return (
    <View className="bg-[#E7A35A] rounded-2xl p-4 flex-1">
      <View className="flex-row justify-between items-center">
        <Text className="text-white text-sm flex-1 mr-1" numberOfLines={1}>{label}</Text>
        <Ionicons name={icon} size={16} color="rgba(255,255,255,0.8)" />
      </View>
      <View className="flex-row items-end mt-3 gap-2">
        <Text className="text-white text-3xl" adjustsFontSizeToFit numberOfLines={1}>{value}</Text>
        {badge && (
          <View className="bg-white/20 rounded-full px-2 py-0.5 mb-1 flex-row items-center">
            <Ionicons name="arrow-up" size={9} color="white" />
            <Text className="text-white text-xs ml-0.5">{badge}</Text>
          </View>
        )}
      </View>
    </View>
  );
}