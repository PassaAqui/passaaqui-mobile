import { FlatList, View, Text, ActivityIndicator } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import Header from "@/src/features/user/shop/components/Header";
import { RatingSummary } from "@/src/features/user/shop/components/RatingSummary";
import { RatingItem } from "@/src/features/user/shop/components/RatingItem";
import { useProductRatings, getAverageRating } from "@/src/features/user/shop/hooks/products/useProductRatings";

export default function ProductRatingsScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: ratings, isLoading } = useProductRatings(Number(id));

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-white">
      <Header />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#EAAA6A" />
        </View>
      ) : (
        <FlatList
          data={ratings ?? []}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
          ListHeaderComponent={
            <View className="px-6 pt-6 pb-4 gap-4 border-b border-gray-200">
              <Text className="text-lg font-interBold">Opiniões</Text>
              <RatingSummary average={getAverageRating(ratings ?? [])} total={ratings?.length ?? 0} />
            </View>
          }
          renderItem={({ item }) => (
            <View className="px-6 py-5 border-b border-gray-200">
              <RatingItem rating={item} />
            </View>
          )}
          ListEmptyComponent={
            <Text className="opacity-55 font-inter text-center p-6">Este produto ainda não possui avaliações.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}