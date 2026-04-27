import { ScrollView, View, Text, Image, Pressable, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as NavigationBar from "expo-navigation-bar";
import XpBar from "@/src/components/user/map/poi/shop/XpBar";
import CompleteRequiredXp from "@/src/components/user/map/poi/shop/CompleteRequiredXp";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import { products } from "@/src/constants/user/map/poi/shop/products";

const filters: string[] = ["TODOS", "GASTRONOMIA", "ARTESANATO", "PASS"];
const currentXp = 500;

export default function Shop() {
  const [selectFilter, setSelectFilter] = useState<string>("TODOS");
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
    <SafeAreaView>
      <View className="flex-row items-center justify-center p-2">
        <Text className="font-itim text-black text-3xl" adjustsFontSizeToFit>Loja global</Text>
      </View>

      <ScrollView>
        <View className="flex-1 w-full p-4 gap-6">
          <View className="bg-[#C4843A] w-full p-7 rounded-lg flex-row gap-3 items-center">
            <Image className="w-16 h-16" source={require("@/assets/user/map/poi/shop/coin.png")}/>
            <View>
              <Text className="font-itim text-white text-lg" adjustsFontSizeToFit>SEU SALDO DE XP</Text>
              <Text className="font-itim text-white text-lg" adjustsFontSizeToFit>1207 XP</Text>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row" contentContainerClassName="flex-row gap-2">
            {filters.map((filter) => (
              <Pressable
                key={filter}
                onPress={() => setSelectFilter(filter)}
                className={`${selectFilter === filter ? 'bg-[#EAAA6A]' : 'bg-white border border-gray-400'} p-2 px-5 rounded-3xl min-w-1/4 items-center justify-center`}
              >
                <Text className={`${selectFilter === filter ? 'text-white' : 'text-black'}`}>{filter}</Text>  
              </Pressable>
            ))}
          </ScrollView>

          <View className="flex-row flex-wrap gap-6 items-center justify-center">
            {products.map((product) => (
              <Pressable
                key={product.id}
                onPress={() => router.push(`/user/map/poi/shop/${product.id}`)}
                className="border-2 border-[#EAAA6A] rounded-lg overflow-hidden"
                style={{ width: cardWidth }}
              >
                <Image className="w-full h-28 bg-gray-400" source={require("@/assets/user/map/tmp/no-image.png")} resizeMode="cover" />
                <View className="p-5 gap-3">
                  <Text className="text-lg">{product.title}</Text>
                  <Text>{product.description}</Text>

                  <View className="flex-row gap-1 items-center">
                    <Image className="w-6 h-6" source={require("@/assets/user/map/poi/shop/coin.png")} />
                    <Text>R$ {product.price}</Text>
                  </View>

                  <View>
                    <XpBar currentXp={currentXp} xpRequired={product.xpRequired} thickness={1} />
                    <View className="flex-row gap-2 items-center">
                      <Text className="font-itim">{currentXp}/{product.xpRequired} XP</Text>
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