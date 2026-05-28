import { ScrollView, View, Image, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import { products } from "@/src/constants/user/map/poi/shop/products";

export default function PaymentConfirmedScreen() {
  const { id, discount } = useLocalSearchParams<{ id: string, discount: string }>();
  const product = products.find(p => p.id === Number(id));

  if (!product) return null;

  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-white">

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: insets.bottom + 16 }} showsVerticalScrollIndicator={false}>
        <View className="items-center justify-center p-6 gap-6">
          <View className="flex-col items-center justify-center gap-4">
            <View className="bg-[#E8F5E9] p-5 rounded-full border-[3px] border-[#A8D5B0] items-center justify-center">
              <Image className="w-12 h-12" source={require("@/assets/user/map/poi/shop/check.png")} />
            </View>

            <View className="items-center justify-center">
              <Text className="font-interBold text-green-800 text-2xl text-center">Pagamento confirmado!</Text>
              <Text className="font-inter text-center">PIX processador com sucesso</Text>
            </View>
          </View>

          <View className="w-full items-center justify-center gap-5 mt-4">
            <View className="w-full border border-gray-400 flex-col rounded-2xl px-4 py-4">
              <Text className="font-interBold" adjustsFontSizeToFit>RESUMO DO PEDIDO</Text>
              <View className="w-full flex-row items-center py-3 gap-3">
                <Image className="w-20 h-20 rounded-lg" source={{ uri: "https://static.thenounproject.com/png/3674270-200.png" }} />
                <View className="flex-col flex-1">
                  <Text className="text-lg font-interBold" adjustsFontSizeToFit>{product.title}</Text>
                  <Text className="opacity-75 font-inter" adjustsFontSizeToFit>{product.location}</Text>
                </View>
                <Text className="font-interBold text-lg">R$ {product.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</Text>
              </View>

              <View className="h-px w-full bg-gray-300 mb-4" />

              <View className="gap-1">
                <View className="flex-row justify-between">
                  <Text className="opacity-75 font-inter flex-1" adjustsFontSizeToFit>Subtotal</Text>
                  <Text className="font-inter" adjustsFontSizeToFit>R$ {product.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</Text>
                </View>

                <View className="flex-row justify-between">
                  <View className="flex-row gap-1 items-center flex-1">
                    <Image className="w-6 h-6" source={require("@/assets/user/map/poi/shop/coin.png")} />
                    <Text className="text-[#A86830] font-interBold text-base flex-1" adjustsFontSizeToFit>Desconto XP</Text>
                  </View>
                  <Text className="font-interBold text-green-600" adjustsFontSizeToFit>- R$ {parseFloat(discount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</Text>
                </View>

                <View className="flex-row justify-between">
                  <Text className="opacity-75 font-inter flex-1" adjustsFontSizeToFit>Taxa de serviço</Text>
                  <Text className="font-inter" adjustsFontSizeToFit>R$ 0,00</Text>
                </View>
              </View>

              <View className="h-px w-full bg-gray-300 my-3" />

              <View className="flex-row justify-between items-center">
                <Text className="font-interBold text-lg">Total pago</Text>
                <Text className="font-interBold text-xl">R$ {(product.price - Number(discount)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</Text>
              </View>
            </View>

            <View className="w-full border border-gray-400 flex-col rounded-2xl px-4 py-4">
              <Text className="font-interBold flex-1" adjustsFontSizeToFit>DETALHES DO PAGAMENTO</Text>

              <View className="w-full flex-row items-center pt-2">
                <View className="flex-col flex-1 gap-1">
                  <View className="flex-row justify-between">
                    <Text className="opacity-75 font-inter flex-1" adjustsFontSizeToFit>Método</Text>
                    <View className="flex-row gap-2 items-center justify-center">
                      <Image className="w-6 h-6" source={require("@/assets/user/map/poi/shop/payment/pix-green.png")} />
                      <Text className="font-interBold text-[#32BCAD]" adjustsFontSizeToFit>PIX</Text>
                    </View>
                  </View>

                  <View className="flex-row justify-between">
                    <Text className="opacity-75 font-inter flex-1" adjustsFontSizeToFit>Data e hora</Text>
                    <Text className="font-inter" adjustsFontSizeToFit>14/04/2026 às 14:32</Text>
                  </View>

                  <View className="flex-row justify-between">
                    <Text className="opacity-75 font-inter flex-1" adjustsFontSizeToFit>Código</Text>
                    <Text className="font-interBold opacity-55" adjustsFontSizeToFit>#A3F92</Text>
                  </View>

                  <View className="flex-row justify-between">
                    <Text className="opacity-75 font-inter flex-1" adjustsFontSizeToFit>Status</Text>
                    <View className="flex-row items-center justify-center gap-1">
                      <View className="bg-green-600 w-3 h-3 rounded-full" />
                      <Text className="font-interBold text-green-600" adjustsFontSizeToFit>Aprovado</Text>
                    </View>
                  </View>
                  
                </View>
              </View>
            </View>

            <View className="w-full flex-row bg-[#FEF3E2] border border-[#F0D49A] p-3 justify-between rounded-xl items-center gap-3">
              <Image className="w-6 h-6" source={require("@/assets/user/map/poi/shop/coin.png")} />
              <Text className="font-inter text-[#a86830] flex-1" adjustsFontSizeToFit><Text className="font-interBold">250 XP</Text> foram debitados do seu saldo. Saldo atual: <Text className="font-interBold">1.000 XP</Text></Text>
            </View>
          </View>

          <View className="w-full gap-2">
            <Pressable className="bg-[#311e08] p-4 items-center justify-center rounded-xl active:opacity-70">
              <Text className="text-white font-interBold text-lg text-center">Ver meus resgates</Text>
            </Pressable>

            <Pressable
              onPress={() => router.push({
                pathname: "/user/map/poi/shop/product",
                params: { id: product.id, discount }
              })}
              className="bg-transparent p-4 items-center justify-center rounded-xl active:opacity-50 border border-gray-400"
            >
              <Text className="text-black font-interBold text-lg text-center">Voltar à loja</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}