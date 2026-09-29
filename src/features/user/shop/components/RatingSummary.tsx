import { View, Text } from "react-native";
import StarRating from "@/src/features/user/shop/components/StarRating";

type Props = {
  average: number;
  total: number;
};

export function RatingSummary({ average, total }: Props) {
  return (
    <View className="flex-row items-center gap-3">
      <Text className="text-5xl font-interBold text-[#A86830]">{average.toFixed(1)}</Text>

      <View className="gap-1">
        <StarRating rating={average} />
        <Text className="opacity-55 font-inter text-sm">{total} avaliações</Text>
      </View>
    </View>
  );
}