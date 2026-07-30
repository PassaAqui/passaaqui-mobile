import { ScrollView, View, Text, Image, Pressable, ActivityIndicator, Alert } from "react-native";
import Header from "@/src/features/user/shop/components/Header";
import RedemptionAlertModal from "@/src/features/user/shop/components/RedemptionAlertModal";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { useProductDetail } from "@/src/features/user/shop/hooks/products/useProductDetail";
import { useTouristMe } from "@/src/features/user/auth/hooks/useTouristMe";
import { useCheckout } from "@/src/features/user/payment/hooks/useCheckout";

// quantidade de desconto por hora fixa enquanto o backend ainda n retorna
const MOCKED_XP_DISCOUNT = 5.0;

export default function SummaryOrderScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: product } = useProductDetail(Number(id));
  const { data: user } = useTouristMe();
  const { mutate: checkout, isPending } = useCheckout();

  const [showActiveOrderModal, setShowActiveOrderModal] = useState(false);

  if (!product) return null;

  const total = product.price - MOCKED_XP_DISCOUNT;

  const handlePay = () => {
    checkout(Number(id), {
      onSuccess: (order) => {
        router.push({
          pathname: "/user/(private)/payment/pix-payment",
          params: { orderId: order.id },
        });
      },
      onError: (error: any) => {
        const status = error?.response?.status;
        if (status === 409) {
          setShowActiveOrderModal(true);
        } else if (status === 400) {
          Alert.alert("Erro", "Produto sem estoque disponível ou dados inválidos.");
        } else {
          Alert.alert("Erro", "Não foi possível gerar o pedido. Tente novamente.");
        }
      },
    });
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-white">
      <Header />

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: insets.bottom + 16 }} showsVerticalScrollIndicator={false}>
        <View className="items-center justify-center p-6 gap-5">
          <View className="w-full border border-gray-400 flex-col rounded-xl px-4 pt-4">
            <Text className="font-interBold" adjustsFontSizeToFit>RESUMO DO PEDIDO</Text>
            <View className="w-full flex-row items-center py-3 gap-3">
              <Image
                className="w-20 h-20 rounded-lg"
                source={typeof product.image === "string" ? { uri: product.image } : require("@/assets/user/map/tmp/no-image.png")}
              />
              <View className="flex-col flex-1">
                <Text className="text-lg font-interBold" adjustsFontSizeToFit>{product.name}</Text>
                <Text className="opacity-75 font-inter" adjustsFontSizeToFit>{product.poi.name}</Text>
              </View>
              <Text className="font-interBold text-lg">
                R$ {product.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </Text>
            </View>
          </View>

          <View className="w-full border border-gray-400 flex-col rounded-xl p-4">
            <View className="flex-row gap-2 pb-2 items-center">
              <Image className="w-6 h-6" source={require("@/assets/user/map/poi/shop/coin.png")} />
              <View className="flex-1">
                <Text className="font-interBold" adjustsFontSizeToFit>XP USADO</Text>
              </View>
            </View>

            <View className="w-full flex-row items-center pb-3">
              <View className="w-full flex-row flex-1 justify-between">
                <Text className="opacity-75 font-inter flex-1" adjustsFontSizeToFit>Saldo disponível</Text>
                <View className="flex-row gap-1 items-center">
                  <Image className="w-6 h-6" source={require("@/assets/user/map/poi/shop/coin.png")} />
                  <Text className="text-[#A86830] font-interBold" adjustsFontSizeToFit numberOfLines={1}>
                    {(user?.currentXP ?? 0).toLocaleString("pt-BR")} XP
                  </Text>
                </View>
              </View>
            </View>

            <View className="w-full flex-row bg-[#FEF3E2] border border-[#F0D49A] p-3 justify-between rounded-xl">
              <View className="flex-1 flex-row gap-2 items-center">
                <Image className="w-4 h-4" source={require("@/assets/user/map/poi/shop/check.png")} />
                <Text className="font-interBold text-[#7A5C1E] flex-1" adjustsFontSizeToFit>{product.maxXp} XP aplicados</Text>
              </View>
              <Text className="text-green-600 font-interBold" adjustsFontSizeToFit>
                - R$ {MOCKED_XP_DISCOUNT.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} (MOCKADO)
              </Text>
            </View>
          </View>

          <View className="w-full border border-gray-400 flex-col rounded-xl p-4">
            <Text className="font-interBold flex-1" adjustsFontSizeToFit>MÉTODO DE PAGAMENTO</Text>

            <View className="flex-row bg-[#F0FAF8] border border-[#32BCAD] p-3 rounded-xl mt-3 items-center justify-between">
              <View className="flex-row gap-3 items-center flex-1">
                <Image className="w-12 h-12" source={require("@/assets/user/map/poi/shop/payment/pix.png")} />
                <View className="flex-col flex-1">
                  <Text className="font-interBold text-green-700 text-xl" adjustsFontSizeToFit>PIX</Text>
                  <Text className="text-green-600 font-inter" adjustsFontSizeToFit>Pagamento instantâneo</Text>
                </View>
              </View>
              <Image className="w-7 h-7" source={require("@/assets/user/map/poi/shop/check.png")} />
            </View>
          </View>

          <View className="w-full border border-gray-400 flex-col rounded-xl px-4 pt-4">
            <Text className="font-interBold flex-1" adjustsFontSizeToFit>TOTAL</Text>

            <View className="w-full flex-row items-center pb-3">
              <View className="flex-col flex-1 gap-1">
                <View className="flex-row justify-between">
                  <Text className="opacity-75 font-inter flex-1" adjustsFontSizeToFit>Subtotal</Text>
                  <Text className="font-inter" adjustsFontSizeToFit>
                    R$ {product.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </Text>
                </View>

                <View className="flex-row justify-between">
                  <View className="flex-row gap-1 items-center flex-1">
                    <Image className="w-6 h-6" source={require("@/assets/user/map/poi/shop/coin.png")} />
                    <Text className="text-[#A86830] font-interBold text-lg flex-1" adjustsFontSizeToFit>Desconto XP</Text>
                  </View>
                  <Text className="font-interBold text-green-600" adjustsFontSizeToFit>
                    - R$ {MOCKED_XP_DISCOUNT.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} (MOCKADO)
                  </Text>
                </View>

                <View className="h-px w-full bg-gray-300 mb-2" />

                <View className="flex-row justify-between items-center flex-1">
                  <Text className="font-interBold text-lg">Total</Text>
                  <Text className="font-interBold text-xl">
                    R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} (MOCKADO)
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View className="w-full gap-2 pt-6">
            <Pressable
              onPress={handlePay}
              disabled={isPending}
              className="bg-[#311e08] p-4 items-center justify-center rounded-xl active:opacity-70 flex-row gap-2"
            >
              {isPending && <ActivityIndicator color="#fff" />}
              <Text className="text-white font-interBold text-lg">
                {isPending ? "Gerando PIX..." : "Pagar com PIX"}
              </Text>
            </Pressable>
            <Text className="opacity-55 text-sm text-center font-inter">Você será redirecionado para o QR Code do PIX</Text>
          </View>
        </View>
      </ScrollView>

      <RedemptionAlertModal
        img={typeof product.image === "string" ? product.image : ""}
        title={product.name}
        discount={MOCKED_XP_DISCOUNT}
        visible={showActiveOrderModal}
        onClose={() => setShowActiveOrderModal(false)}
      />
    </SafeAreaView>
  );
}