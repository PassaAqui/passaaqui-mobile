import { ScrollView, View, Text, Image, Pressable, useWindowDimensions } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import * as NavigationBar from "expo-navigation-bar";
import XpBar from "@/src/features/roles/user/shop/components/XpBar";
import CompleteRequiredXp from "@/src/features/roles/user/shop/components/CompleteRequiredXp";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useAllProducts } from "@/src/features/roles/user/shop/hooks/products/useAllProducts";
import { useAllCategories } from "@/src/features/roles/user/shop/hooks/categories/useAllCategories";
import { useCategoryProducts } from "@/src/features/roles/user/shop/hooks/categories/useCategoryProducts";
import { useTouristMe } from "@/src/features/roles/user/auth/hooks/useTouristMe";

export default function GlobalShopScreen() {
  const router = useRouter();
  const { data: user } = useTouristMe();

  const { data: categories } = useAllCategories();

  // guarda o id selecionado, "TODOS" (string) representa o estado padrão
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "TODOS">("TODOS");

  const { data: allProducts, isLoading: isLoadingAll } = useAllProducts();
  const { data: categoryData, isLoading: isLoadingCategory } = useCategoryProducts(
    selectedCategoryId === "TODOS" ? undefined : selectedCategoryId
  );

  const products = selectedCategoryId === "TODOS"
    ? allProducts
    : categoryData?.products.content;

  const isLoading = selectedCategoryId === "TODOS" ? isLoadingAll : isLoadingCategory;

  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const PADDING = 16;
  const GAP = 24;
  const MIN_CARD_WIDTH = 150;

  const columns = width - PADDING * 2 >= MIN_CARD_WIDTH * 2 + GAP ? 2 : 1;
  const cardWidth = (width - PADDING * 2 - GAP * (columns - 1)) / columns;

  useEffect(() => {
    NavigationBar.setButtonStyleAsync("dark");
  }, [])

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-white">
      <View className="flex-row items-center justify-center p-2">
        <Text className="font-interBold text-black text-2xl" adjustsFontSizeToFit>Loja global</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}>
        <View className="flex-1 w-full p-4 gap-6">
          <View className="bg-[#C4843A] w-full p-7 rounded-lg flex-row gap-3 items-center">
            <Image className="w-16 h-16" source={require("@/assets/user/map/poi/shop/coin.png")}/>
            <View className="flex-1">
              <Text className="font-interBold text-white text-base" adjustsFontSizeToFit>SEU SALDO DE XP</Text>
              <Text className="font-interBold text-white text-2xl" adjustsFontSizeToFit>{user?.currentXP ?? 0} XP</Text>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row" contentContainerClassName="flex-row gap-2">
            <Pressable
              onPress={() => setSelectedCategoryId("TODOS")}
              className={`${selectedCategoryId === "TODOS" ? 'bg-[#EAAA6A]' : 'bg-white border border-gray-400'} p-2 px-5 rounded-3xl min-w-1/4 items-center justify-center`}
            >
              <Text className={`${selectedCategoryId === "TODOS" ? 'text-white' : 'text-black'} font-inter`}>TODOS</Text>  
            </Pressable>

            {categories?.map((category) => (
              <Pressable
                key={category.id}
                onPress={() => setSelectedCategoryId(category.id)}
                className={`${selectedCategoryId === category.id ? 'bg-[#EAAA6A]' : 'bg-white border border-gray-400'} p-2 px-5 rounded-3xl min-w-1/4 items-center justify-center`}
              >
                <Text className={`${selectedCategoryId === category.id ? 'text-white' : 'text-black'} font-inter uppercase`} numberOfLines={1}>{category.name}</Text>  
              </Pressable>
            ))}
          </ScrollView>

          {!isLoading && (!products || products.length === 0) && (
            <Text className="text-center text-black opacity-55 font-inter">
              {selectedCategoryId === "TODOS"
                ? "Ainda não há produtos cadastrados na plataforma."
                : "Nenhum produto encontrado nessa categoria."}
            </Text>
          )}

          <View className="flex-row flex-wrap gap-6 items-center justify-center">
            {products?.map((product) => (
              <Pressable
                key={product.id}
                onPress={() => router.push({
                  pathname: "/user/(private)/shop/product",
                  params: { id: product.id }
                })}
                className="border-2 border-[#EAAA6A] rounded-lg overflow-hidden"
                style={{ width: cardWidth }}
              >
                <Image className="w-full h-28 border border-gray-300" source={typeof product.image === "string" ? { uri: product.image } : require("@/assets/user/map/tmp/no-image.png")} resizeMode="cover" />
                <View className="p-5 gap-3">
                  <Text className="font-interBold text-lg">{product.name}</Text>
                  <Text className="font-inter">{product.description}</Text>

                  <View className="flex-row gap-1 items-center">
                    <Image className="w-6 h-6" source={require("@/assets/user/map/poi/shop/coin.png")} />
                    <Text className="font-interBold">R$ {product.price.toFixed(2)}</Text>
                  </View>

                  <View>
                    <XpBar currentXp={user?.currentXP ?? 0} xpRequired={product.maxXp ?? 0} thickness={1} />
                    <View className="flex-row gap-2 items-center">
                      <Text className="font-inter text-sm">{user?.currentXP ?? 0}/{product.maxXp} XP</Text>
                      <CompleteRequiredXp currentXp={user?.currentXP ?? 0} requiredXp={product.maxXp ?? 0} showText={false} />
                    </View>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}