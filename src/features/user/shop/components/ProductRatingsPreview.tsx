import { View, Text, Image, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { RatingSummary } from "@/src/features/user/shop/components/RatingSummary";
import { RatingItem } from "@/src/features/user/shop/components/RatingItem";
import { useProductRatings, getAverageRating } from "@/src/features/user/shop/hooks/products/useProductRatings";

type Props = {
  productId: number;
};

export function ProductRatingsPreview({ productId }: Props) {
  const router = useRouter();
  const { data: ratings } = useProductRatings(productId);

  if (!ratings) return null;

  const total = ratings.length;
  const preview = ratings.slice(0, 2);

  const photoItems = ratings.flatMap((item) => item.photos.map((uri) => ({ uri, rating: item.rating })));
  const stripPhotos = photoItems.slice(0, 3);
  const remainingPhotos = photoItems.length - stripPhotos.length;

  const goToAll = () => router.push({
    pathname: "/user/(private)/shop/product-ratings",
    params: { id: productId }
  });

  return (
    <View className="w-full gap-4 border-t border-gray-200 pt-6">
      <Text className="text-lg font-interBold">Avaliações</Text>

      {total === 0 ? (
        <Text className="opacity-55 font-inter">Este produto ainda não possui avaliações.</Text>
      ) : (
        <>
          <RatingSummary average={getAverageRating(ratings)} total={total} />

          {stripPhotos.length > 0 && (
            <View className="gap-2">
              <Text className="font-interBold">Avaliações com fotos</Text>

              <View className="flex-row gap-2">
                {stripPhotos.map((photo, index) => (
                  <Pressable
                    key={photo.uri}
                    onPress={goToAll}
                    className="flex-1 h-36 rounded-xl overflow-hidden bg-gray-200 active:opacity-55"
                  >
                    <Image source={{ uri: photo.uri }} className="w-full h-full" resizeMode="cover" />

                    {index === stripPhotos.length - 1 && remainingPhotos > 0 ? (
                      <View className="absolute inset-0 bg-black/60 items-center justify-center">
                        <Text className="text-white text-xl font-interBold">+{remainingPhotos}</Text>
                      </View>
                    ) : (
                      <View className="absolute bottom-2 left-2 flex-row items-center gap-1">
                        <Text className="text-white font-interBold">{photo.rating}</Text>
                        <Text className="text-white">★</Text>
                      </View>
                    )}
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          <View className="gap-5">
            {preview.map((item) => (
              <RatingItem key={item.id} rating={item} />
            ))}
          </View>

          {total > 2 && (
            <Pressable onPress={goToAll} className="flex-row items-center gap-1 active:opacity-55">
              <Text className="text-[#A86830] font-interBold">Ver mais comentários</Text>
              <Text className="text-[#A86830] font-interBold">›</Text>
            </Pressable>
          )}
        </>
      )}
    </View>
  );
}