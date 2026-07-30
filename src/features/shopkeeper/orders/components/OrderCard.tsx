import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DisplayOrder, STATUS_CONFIG } from "../utils/orderMapper";

interface OrderCardProps {
  order: DisplayOrder;
  onPress: () => void;
}

export function OrderCard({ order, onPress }: OrderCardProps) {
  const statusCfg = STATUS_CONFIG[order.status];

  return (
    <TouchableOpacity
      className="bg-white rounded-2xl border border-[#E8E3DE] px-4 py-4 mb-3"
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center flex-1 mr-2">
          <View className="w-10 h-10 rounded-full bg-[#E7A35A] items-center justify-center">
            <Text className="text-white font-interBold text-sm">{order.initials}</Text>
          </View>
          <Text className="ml-2.5 text-base font-interBold text-[#2D2D2D] flex-1" numberOfLines={1}>
            {order.name}
          </Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="time-outline" size={13} color="#8A8A8A" />
          <Text className="ml-1 text-xs text-[#8A8A8A] font-inter">{order.time}</Text>
        </View>
      </View>

      <View className="h-px bg-[#E8E3DE] my-3" />

      <View className="flex-row items-start">
        <Ionicons name="bag-handle-outline" size={14} color="#8A8A8A" />
        <Text className="ml-2 text-sm text-[#8A8A8A] font-inter flex-1" numberOfLines={2}>
          {order.items}
        </Text>
      </View>

      <View className="h-px bg-[#E8E3DE] my-3" />

      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center">
          <Ionicons name="key-outline" size={13} color="#8A8A8A" />
          <Text className="ml-1.5 text-xs text-[#8A8A8A] font-inter">Código</Text>
          <View className="bg-[#E7A35A] px-2.5 py-1 rounded-lg ml-2">
            <Text className="text-white text-xs font-interBold">#{order.code}</Text>
          </View>
        </View>
        <View className="flex-row items-center gap-1.5">
          <View className="px-3 py-1.5 rounded-xl flex-row items-center" style={{ backgroundColor: statusCfg.bgColor }}>
            <Ionicons name={statusCfg.icon} size={13} color={statusCfg.iconColor} />
            <Text className="ml-1 text-xs font-inter" style={{ color: statusCfg.textColor }}>
              {statusCfg.label}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#8A8A8A" />
        </View>
      </View>
    </TouchableOpacity>
  );
}