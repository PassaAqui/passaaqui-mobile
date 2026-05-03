// currentXP - colocar na posta constants
// pegar a quantidade de avaliações do backend
// pegar 'category' do backend

import { ScrollView, View, Image, Text, Pressable, ImageSourcePropType } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect } from "react";
import * as NavigationBar from "expo-navigation-bar"
import XpBar from "@/src/components/user/map/poi/shop/XpBar";
import CompleteRequiredXp from "@/src/components/user/map/poi/shop/CompleteRequiredXp";
import StarRating from "@/src/components/user/map/poi/shop/StarRating";
import { useRedemptionCheck } from "@/src/hooks/user/map/shop/useRedemptionCheck";
import RedemptionAlertModal from "@/src/components/user/map/poi/shop/RedemptionAlertModal";

interface ProductProps {
  img: ImageSourcePropType,
  requiredXp: number,
  title: string,
  location: string,
  description: string
}

const currentXP = 250;

export default function ProductScreen({ img, requiredXp, title, location, description }: ProductProps) {
  const insets = useSafeAreaInsets();
  const { hasRedeemed, setRedeemed } = useRedemptionCheck();

  const canRescue = currentXP >= requiredXp;

  useEffect(() => {
    NavigationBar.setButtonStyleAsync("dark");
  }, [])

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-white">
      <StatusBar style="dark"/>

      <View className="bg-white flex-row items-center justify-between p-2 px-6">
        <Pressable className="active:opacity-35">
          <Image source={require("@/assets/user/settings/back.png")} />
        </Pressable>

        <Image className="w-10 h-10" source={require("@/assets/logo/logoOFC.png")} />
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}>
        <View className="items-center justify-center p-6 gap-5">
          <View className="w-full relative overflow-hidden">
            <Image className="bg-gray-400 w-full h-56" source={img} resizeMode="cover" />

            <View className="absolute bottom-3 right-3 bg-[#3D2408] px-3 p-1 flex-row rounded-full gap-1 items-center justify-center">
              <Image className={`${canRescue ? 'w-5 h-5' : 'w-6 h-6'}`} source={canRescue ? require("@/assets/user/map/poi/shop/coin.png") : require("@/assets/user/map/poi/shop/no-coin.png")} />
              <Text className="text-white text-sm text-center">{requiredXp} XP</Text>
            </View>
          </View>

          <View className="flex-row justify-between w-full px-3">
            <View className="flex-1">
              <Text className="text-2xl">{title}</Text>
              <Text className="opacity-55">{location}</Text>

              <View className="flex-row gap-1 items-center">
                <StarRating rating={4} />
                <Text className="opacity-55">4.0 (128 avaliações)</Text>
              </View>
            </View>

            <View className={`${canRescue ? 'bg-[#EAAA6A]' : 'bg-[#F0EEEA] border border-gray-300'} items-center justify-center p-2 px-4 rounded-3xl self-start shrink-0`}>
              <Text className={`${canRescue ? 'text-white' : 'text-black'}`}>GASTRONOMIA</Text>
            </View>
          </View>

          <View className="gap-5 w-full">
            <View className="border-2 border-[#EAAA6A] rounded-2xl px-4 py-5 gap-2">
              <Text className="text-lg" adjustsFontSizeToFit>SOBRE O PRODUTO</Text>
              <Text className="text-justify opacity-70" adjustsFontSizeToFit>{description}</Text>
            </View>

            <View className="border border-[#EAAA6A] rounded-2xl px-4 py-5 gap-2">
              <Text className="text-lg  adjustsFontSizeToFit">DETALHES DO DESCONTO</Text>
              <View className="justify-between flex-row flex-wrap">
                <Text className="opacity-70" adjustsFontSizeToFit>Valor do desconto</Text>
                <Text className="text-green-700"  adjustsFontSizeToFit>- R$ 5,00</Text>
              </View>

              <View className="justify-between flex-row flex-wrap">
                <Text className="opacity-70" adjustsFontSizeToFit>Validade</Text>
                <Text adjustsFontSizeToFit>30 dias após o resgate</Text>
              </View>

              <View className="justify-between flex-row flex-wrap">
                <Text className="opacity-70" adjustsFontSizeToFit>Uso</Text>
                <Text adjustsFontSizeToFit>1 vez por resgate</Text>
              </View>
            </View>

            <View className={`${canRescue ? 'bg-[#E0DBD5]' : 'bg-[#FFF3F3]'} border ${canRescue ? 'border-gray-300' : 'border-[#F5C0C0]'} rounded-2xl px-4 py-5 flex-col gap-2`}>
              <View className="flex-row justify-between flex-wrap">
                <Text className="text-lg flex-1" adjustsFontSizeToFit>SEU PROGRESSO</Text>
                <View className="flex-row gap-1 items-center justify-center shrink-0">
                  <Image className="w-6 h-6" source={require("@/assets/user/map/poi/shop/coin.png")} />
                  <Text className="text-[#A86830]" adjustsFontSizeToFit>{currentXP} / {requiredXp} XP</Text>
                </View>
              </View>

              <XpBar currentXp={currentXP} xpRequired={requiredXp} thickness={3}/>

              <View className="flex-row gap-2 items-center">
                <CompleteRequiredXp currentXp={currentXP} requiredXp={requiredXp} showText={true} />
              </View>
            </View>
          </View>

          <View className="w-full items-center justify-center gap-2 shrink-0">
            <Pressable onPress={canRescue ? () => setRedeemed(true) : undefined} disabled={!canRescue} className={`${canRescue ? 'bg-[#EAAA6A]' : 'bg-[#888888]'} w-full p-4 items-center rounded-xl active:opacity-55`}>
              <Text className="text-white text-lg">Resgatar</Text>
            </Pressable>

            <Text className={`text-sm text-center ${canRescue ? 'opacity-55' : 'text-red-500'}`}>
              {canRescue 
                ? `Ao resgatar, ${requiredXp} XP serão debitados do seu saldo`
                : `Você precisa de mais ${requiredXp - currentXP} XP para resgatar esse item`
              }
            </Text>
          </View>
        </View>
      </ScrollView>

      {hasRedeemed && (
        <RedemptionAlertModal visible={hasRedeemed} onClose={() => setRedeemed(false)} />
      )}
    </SafeAreaView>
  )
}