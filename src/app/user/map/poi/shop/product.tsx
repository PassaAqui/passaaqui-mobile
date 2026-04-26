// currentXP - colocar na posta constants
// pegar a quantidade de avaliações do backend
// pegar 'category' do backend
// ver como eu vou fazer a representação das estrelinhas

import { ScrollView, View, Image, Text, Pressable, ImageSourcePropType } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect } from "react";
import * as NavigationBar from "expo-navigation-bar"
import XpBar from "@/src/components/user/map/poi/shop/XpBar";
import CompleteRequiredXp from "@/src/components/user/map/poi/shop/CompleteRequiredXp";
import StarRating from "@/src/components/user/map/poi/shop/StarRating";

interface ProductProps {
  img: ImageSourcePropType,
  requiredXp: number,
  title: string,
  location: string,
  description: string
}

export default function Product({ img, requiredXp, title, location, description }: ProductProps) {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    NavigationBar.setButtonStyleAsync("dark");
  })

  return (
    <SafeAreaView edges={["top"]} className="flex-1">
      <StatusBar style="dark"/>

      <View className="flex-row items-center justify-between p-2 px-6">
        <Pressable className="active:opacity-35">
          <Image source={require("@/assets/user/settings/back.png")} />
        </Pressable>

        <Image className="w-10 h-10" source={require("@/assets/logo/logoOFC.png")} />
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}>
        <View className="items-center justify-center p-6 gap-5">
          <View className="w-full items-center justify-center gap-4 overflow-hidden">
            <Image className="bg-gray-400 w-full h-56" source={require("@/assets/user/map/tmp/no-image.png")} resizeMode="cover" />
          </View>

          <View className="flex-row justify-between w-full px-3">
            <View>
              <Text className="text-2xl">{title}Title</Text>
              <Text className="opacity-55">{location}location</Text>
              <View className="flex-row gap-1 items-center">
                {/**Estrelinhas de avaliação aqui */}
                <StarRating rating={4} />
                <Text className="opacity-55">4.0 (128 avaliações)</Text>
              </View>
            </View>

            <View className="bg-[#EAAA6A] items-center justify-center p-2 px-4 rounded-3xl self-start">
              <Text className="text-white">GASTRONOMIA</Text>
            </View>
          </View>

          <View className="gap-5">
            <View className="border-2 border-[#EAAA6A] rounded-2xl px-4 py-5 gap-2">
              <Text className="text-lg">SOBRE O PRODUTO</Text>
              <Text className="text-justify opacity-70">{description}Lorem, ipsum dolor sit amet consectetur adipisicing elit. Voluptatum officiis id obcaecati, nesciunt suscipit aut doloribus reiciendis nobis ea illum quo? Maiores amet quia quas dolorum aut velit voluptas officiis.</Text>
            </View>

            <View className="border border-[#EAAA6A] rounded-2xl px-4 py-5 gap-2">
              <Text className="text-lg">DETALHES DO DESCONTO</Text>
              <View className="justify-between flex-row">
                <Text className="opacity-70">Valor do desconto</Text>
                <Text className="text-green-700">- R$ 5,00</Text>
              </View>

              <View className="justify-between flex-row">
                <Text className="opacity-70">Validade</Text>
                <Text>30 dias após o resgate</Text>
              </View>

              <View className="justify-between flex-row">
                <Text className="opacity-70">Uso</Text>
                <Text>1 vez por resgate</Text>
              </View>
            </View>

            <View className="bg-[#E0DBD5] border border-gray-300 rounded-2xl px-4 py-5 flex-col gap-2">
              <View className="flex-row justify-between">
                <Text className="text-lg">SEU PROGRESSO</Text>
                <View className="flex-row gap-1 items-center justify-center">
                  <Image className="w-6 h-6" source={require("@/assets/user/map/poi/shop/coin.png")} />
                  <Text>250 / {requiredXp}250 XP</Text>
                </View>
              </View>

              <XpBar currentXp={250} xpRequired={250} thickness={3}/>

              <View className="flex-row gap-2 items-center">
                <CompleteRequiredXp currentXp={250} requiredXp={250} showText={true} />
              </View>
            </View>
          </View>

          <View className="w-full items-center justify-center gap-2">
            <Pressable className="bg-[#EAAA6A] w-full p-4 items-center rounded-xl active:opacity-55">
              <Text className="text-white text-lg">Resgatar</Text>
            </Pressable>

            <Text className="text-sm opacity-55">Ao resgatar, {requiredXp}250 XP serão debitados do seu saldo</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}