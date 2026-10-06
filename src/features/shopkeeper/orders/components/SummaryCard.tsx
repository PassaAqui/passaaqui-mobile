import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SummaryCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  count: number;
  label: string;
}

export function SummaryCard({ icon, count, label }: SummaryCardProps) {
  return (
    <View className="flex-1 bg-[#E7A35A] rounded-2xl py-4 items-center justify-center">
      <Ionicons name={icon} size={20} color="white" />
      <Text className="text-white text-3xl font-interBold mt-1" adjustsFontSizeToFit numberOfLines={1}>
        {count}
      </Text>
      <Text className="text-white text-xs font-inter text-center px-1 mt-0.5">{label}</Text>
    </View>
  );
}