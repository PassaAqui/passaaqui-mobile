import { ScrollView, View, Text, Image, Pressable, useWindowDimensions } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import XpBar from "@/src/features/user/shop/components/XpBar";
import CompleteRequiredXp from "@/src/features/user/shop/components/CompleteRequiredXp";
import { products } from "@/src/constants/user/map/poi/shop/products";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTouristMe } from "@/src/features/user/auth/hooks/useTouristMe";
import { useProductsByPoi } from "@/src/features/user/shop/hooks/useProductsByPoi";

export default function ShopkeeperShopScreen() {
  const router = useRouter();
  const { data: user } = useTouristMe();
  const { poiId } = useLocalSearchParams<{ poiId: string }>();
  const { data: poi, isLoading } = useProductsByPoi(Number(poiId));

  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const PADDING = 16;
  const GAP = 24;
  const MIN_CARD_WIDTH = 150;

  const columns = width - PADDING * 2 >= MIN_CARD_WIDTH * 2 + GAP ? 2 : 1;
  const cardWidth = (width - PADDING * 2 - GAP * (columns - 1)) / columns;

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-white">
      <View className="flex-row items-center justify-center p-2" style={{ paddingTop: insets.top }}>
        <Pressable onPress={() => router.back()} className="p-2 absolute left-7 top-6 active:opacity-35">
          <Image source={require("@/assets/user/settings/back.png")} />
        </Pressable>
        <Text className="font-itim text-black text-3xl px-20" numberOfLines={1} ellipsizeMode="tail">{poi?.name ?? "Loja"}</Text>
      </View>


      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: insets.bottom + 16 }} showsVerticalScrollIndicator={false}>
        <View className="w-full p-4 gap-6">
          <View className="bg-[#C4843A] w-full p-7 rounded-lg flex-row gap-3 items-center">
            <Image className="w-16 h-16" source={require("@/assets/user/map/poi/shop/coin.png")}/>
            <View className="flex-1">
              <Text className="font-interBold text-white text-base" adjustsFontSizeToFit>SEU SALDO DE XP</Text>
              <Text className="font-interBold text-white text-2xl" adjustsFontSizeToFit>1207 XP</Text>
            </View>
          </View>

          {(!poi?.products || poi.products.length === 0) && (
            <Text className="text-center text-black opacity-55 font-inter">Essa loja ainda não tem produtos cadastrados.</Text>
          )}

          <View className="flex-row flex-wrap gap-6 items-center justify-center">
            {poi?.products.map((product) => (
              <Pressable
                key={product.id}
                onPress={() => router.push({
                  pathname: "/user/(private)/shop/product",
                  params: { id: product.id }
                })}
                className="border-2 border-[#EAAA6A] rounded-lg overflow-hidden"
                style={{ width: cardWidth }}
              >
                <Image className="w-full h-28 bg-gray-400" source={require("@/assets/user/map/tmp/no-image.png")} resizeMode="cover" />
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