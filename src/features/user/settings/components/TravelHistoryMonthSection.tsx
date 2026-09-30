import { View, Text } from "react-native";
import TravelHistoryCard from "@/src/features/user/settings/components/TravelHistoryCard";
import type { MonthGroup } from "@/src/features/user/settings/utils/groupByMonth";

export default function TravelHistoryMonthSection({ label, items }: MonthGroup) {
  return (
    <View className="gap-3 mb-5">
      <Text className="font-interBold text-lg text-black mb-2">{label}</Text>
      {items.map((item) => (
        <TravelHistoryCard key={item.visitId} item={item} />
      ))}
    </View>
  );
}