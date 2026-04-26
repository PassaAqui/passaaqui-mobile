import { View, Text } from "react-native";

interface StarRatingProps {
  rating: number,
  max?: number
}

export default function StarRating({ rating, max = 5 }: StarRatingProps) {
  const percentage = (rating / max) * 100;

  return (
    <View className="flex-row items-center gap-1">
      <View className="flex-row">
        {Array.from({ length: max }).map((_, i) => (
          <Text key={i} className="text-gray-300 text-lg">★</Text>
        ))}
      </View>

      <View className="flex-row absolute overflow-hidden" style={{ width: `${percentage}%` }}>
        {Array.from({ length: max }).map((_, i) => (
          <Text key={i} className="text-yellow-400 text-lg">★</Text>
        ))}
      </View>
    </View>
  );
}