import { ScrollView, View, Image, Text, Pressable } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useOrderStore } from "@/src/stores/user/payment/orderStore";

export default function PaymentConfirmedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const order = useOrderStore((s) => s.order);
  const clearOrder = useOrderStore((s) => s.clearOrder);

  if (!order) return null;

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
              <Text className="font-inter text-center">PIX processado com sucesso</Text>
            </View>
          </View>

          <View className="w-full border border-gray-400 flex-col rounded-2xl px-4 py-4">
            <Text className="font-interBold">RESUMO DO PEDIDO</Text>
            <View className="w-full flex-row items-center py-3 gap-3">
              <View className="flex-col flex-1">
                <Text className="text-lg font-interBold">{order.productName}</Text>
                <Text className="opacity-75 font-inter">{order.shopkeeperName}</Text>
              </View>
              <Text className="font-interBold text-lg">
                R$ {order.totalAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </Text>
            </View>
          </View>

          {order.pickupCode && (
            <View className="w-full flex-row bg-[#FEF3E2] border border-[#F0D49A] p-3 justify-between rounded-xl items-center gap-3">
              <Text className="font-inter text-[#a86830] flex-1">
                Código de retirada: <Text className="font-interBold">{order.pickupCode}</Text>
              </Text>
            </View>
          )}

          <View className="w-full gap-2">
            <Pressable
              onPress={() => {
                clearOrder();
                router.push("/user/(private)/map/(tabs)/purchased");
              }}
              className="bg-[#311e08] p-4 items-center justify-center rounded-xl active:opacity-70"
            >
              <Text className="text-white font-interBold text-lg text-center">Ver meus resgates</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                clearOrder();
                router.push("/user/(private)/shop/product");
              }}
              className="bg-transparent p-4 items-center justify-center rounded-xl active:opacity-50 border border-gray-400"
            >
              <Text className="text-black font-interBold text-lg text-center">Voltar à loja</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}