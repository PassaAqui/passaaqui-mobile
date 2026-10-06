import { View, Text, Image, Pressable, Linking } from "react-native";
import StarRating from "@/src/features/user/shop/components/StarRating";
import { ProductRating } from "@/src/features/user/shop/hooks/products/useProductRatings";

type Props = {
  rating: ProductRating;
};

export function RatingItem({ rating }: Props) {
  const date = new Date(rating.created_at).toLocaleDateString("pt-BR");
  const hasMedia = rating.photos.length > 0 || !!rating.video;

  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between">
        <StarRating rating={rating.rating} />
        <Text className="opacity-55 font-inter text-xs">{date}</Text>
      </View>

      {!!rating.comment && <Text className="font-inter">{rating.comment}</Text>}

      {hasMedia && (
        <View className="flex-row flex-wrap gap-2">
          {rating.photos.map((uri) => (
            <Image key={uri} source={{ uri }} className="w-24 h-24 rounded-xl bg-gray-200" resizeMode="cover" />
          ))}

          {!!rating.video && (
            <Pressable
              onPress={() => Linking.openURL(rating.video!)}
              className="w-24 h-24 rounded-xl bg-[#3D2408] items-center justify-center active:opacity-55"
            >
              <View className="w-10 h-10 rounded-full bg-white/30 items-center justify-center">
                <Text className="text-white text-base">▶</Text>
              </View>
            </Pressable>
          )}
        </View>
      )}

      <Text className="opacity-55 font-inter text-xs">Pedido {rating.order_id}</Text>
    </View>
  );
}