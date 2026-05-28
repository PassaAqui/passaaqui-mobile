import { ScrollView, View, Text, Image, Pressable, useWindowDimensions } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import XpBar from "@/src/components/user/map/poi/shop/XpBar";
import CompleteRequiredXp from "@/src/components/user/map/poi/shop/CompleteRequiredXp";
import { products } from "@/src/constants/user/map/poi/shop/products";
import { useRouter } from "expo-router";

const currentXp = 500;

export default function ShopkeeperStoreScreen() {
  const router = useRouter();

  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const PADDING = 16;
  const GAP = 24;
  const MIN_CARD_WIDTH = 150;

  const columns = width - PADDING * 2 >= MIN_CARD_WIDTH * 2 + GAP ? 2 : 1;
  const cardWidth = (width - PADDING * 2 - GAP * (columns - 1)) / columns;

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-white">
      <View className="flex-row items-center justify-center p-2">
        <Pressable className="absolute left-7 active:opacity-35">
          <Image source={require("@/assets/user/settings/back.png")} />
        </Pressable>
        <Text className="font-itim text-black text-3xl" adjustsFontSizeToFit>Loja de fulano</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}>
        <View className="flex-1 w-full p-4 gap-6">
          <View className="bg-[#C4843A] w-full p-7 rounded-lg flex-row gap-3 items-center">
            <Image className="w-16 h-16" source={require("@/assets/user/map/poi/shop/coin.png")}/>
            <View className="flex-1">
              <Text className="font-interBold text-white text-base" adjustsFontSizeToFit>SEU SALDO DE XP</Text>
              <Text className="font-interBold text-white text-2xl" adjustsFontSizeToFit>1207 XP</Text>
            </View>
          </View>

          <View className="flex-row flex-wrap gap-6 items-center justify-center">
            {products.map((product) => (
              <Pressable
                key={product.id}
                onPress={() => router.push({
                  pathname: "/user/map/poi/shop/product",
                  params: { id: product.id }
                })}
                className="border-2 border-[#EAAA6A] rounded-lg overflow-hidden"
                style={{ width: cardWidth }}
              >
                <Image className="w-full h-28 bg-gray-400" source={{ uri: product.img }} resizeMode="cover" />
                <View className="p-5 gap-3">
                  <Text className="font-interBold text-lg">{product.title}</Text>
                  <Text className="font-inter">{product.description}</Text>

                  <View className="flex-row gap-1 items-center">
                    <Image className="w-6 h-6" source={require("@/assets/user/map/poi/shop/coin.png")} />
                    <Text className="font-interBold">R$ {product.price}</Text>
                  </View>

                  <View>
                    <XpBar currentXp={currentXp} xpRequired={product.xpRequired} thickness={1} />
                    <View className="flex-row gap-2 items-center">
                      <Text className="font-inter text-sm">{currentXp}/{product.xpRequired} XP</Text>
                      <CompleteRequiredXp currentXp={currentXp} requiredXp={product.xpRequired} showText={false} />
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