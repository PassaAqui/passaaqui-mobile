import { ScrollView, View, Text, Image, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import Header from "@/src/components/user/map/poi/shop/Header";

export default function CodeToRedeemScreen() {
  const insets = useSafeAreaInsets();
  const { img, title, discount } = useLocalSearchParams<{ img: string, title: string, discount: string }>();

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-white">
      <Header />
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}>
        <View className="items-center justify-center p-6 gap-6">
          <Text className="text-2xl font-interBold">CÓDIGO ATIVO</Text>

          <View className="w-full border border-gray-400 flex-col rounded-xl pt-4">
            <View className="w-full flex-row items-center pb-3">
              <Image className="w-20 h-20" source={{ uri: img }} />
              <View className="flex-col flex-1">
                <Text className="text-lg font-interBold" adjustsFontSizeToFit>{title}</Text>
                <Text className="opacity-75 font-inter" adjustsFontSizeToFit>Pedido</Text>
                <Text className="text-[#C4843A] font-interBold" adjustsFontSizeToFit>Válido até 20/04/2026</Text>
              </View>
            </View>

            <View className="bg-[#FEF3E2] w-full items-center justify-center border-t-2 border-[#F0D49A] p-4 gap-2 rounded-b-xl">
              <Text className="text-[#A86830] font-interBold">CÓDIGO DO CUPOM</Text>

              <View className="bg-white w-full items-center p-4 border border-dashed border-[#C4843A] rounded-xl">
                <Text className="text-4xl font-interBold" adjustsFontSizeToFit numberOfLines={1}>RCFXP05</Text>
              </View>

              <Text className="text-center text-[#7A5C1E] font-inter">Apresente este código no estabelicimento para obter o desconto de <Text className="font-interBold">R${parseFloat(discount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}.</Text></Text>

              <View className="flex-row gap-4 w-full items-center justify-center p-2">
                <Pressable className="bg-[#3D2409] p-3 px-2 w-2/4 rounded-xl items-center justify-center active:opacity-60">
                  <Text className="text-white text-center font-interBold text-lg">Copiar código</Text>
                </Pressable>

                <Pressable className="bg-white border border-[#C8B89A] p-3 px-2 w-2/4 rounded-xl items-center justify-center active:opacity-40">
                  <Text className="text-center text-black font-interBold text-lg">Fechar</Text>
                </Pressable>
              </View>
            </View>
          </View>


          <View className="w-full gap-3">
            <Text className="text-[#888888] font-interBold">CÓDIGOS USADOS</Text>

            <View className="w-full flex-row items-center p-3 py-4 border border-gray-300 rounded-xl">
              <Image className="w-20 h-20" source={require("@/assets/user/map/tmp/no-image.png")} />
              <View className="flex-col flex-1">
                <Text className="text-lg opacity-65 font-inter" adjustsFontSizeToFit>Tapioca clássica</Text>
                <Text className="opacity-65 text-base font-inter" adjustsFontSizeToFit>Pedido</Text>
                <Text className="text-sm opacity-65 font-inter" adjustsFontSizeToFit>Válido até 20/04/2026</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}