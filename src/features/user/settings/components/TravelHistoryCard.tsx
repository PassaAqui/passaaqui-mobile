import { View, Text, Image } from "react-native";
import type { TravelHistoryItem } from "@/src/features/user/settings/types/travelHistory";
import { formatVisitDate } from "@/src/features/user/settings/utils/formatVisitDate";

const NO_IMAGE = require("@/assets/user/map/tmp/no-image.png");

export default function TravelHistoryCard({ item }: { item: TravelHistoryItem }) {
  return (
    <View className="flex-row items-center border border-gray-200 rounded-2xl p-3 gap-3 bg-white">
      <Image
        className="w-14 h-14 rounded-xl"
        source={item.imageUrl ? { uri: item.imageUrl } : NO_IMAGE}
      />
      <View className="flex-1">
        <Text className="font-interBold text-base text-black">{item.poiName}</Text>
        <Text className="font-inter text-sm text-gray-500">{item.cityName}</Text>
        <Text className="font-inter text-sm text-gray-500">
          {formatVisitDate(item.visitedAt)} · {item.distanceKm.toFixed(2).replace(".", ",")} km
        </Text>
      </View>
      <Text className="font-interBold text-sm text-[#E07B00]">+{item.xpEarned} XP</Text>
    </View>
  );
}