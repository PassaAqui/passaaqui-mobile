import { ScrollView, View, Text, Image, Pressable } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Header from "@/src/features/user/shop/components/Header";
import { usePurchasedProducts } from "@/src/features/user/purchased/hooks/usePurchasedProducts";
import { formatDateBR } from "@/src/features/user/purchased/utils/formatDate";

const NO_IMAGE = require("@/assets/user/map/tmp/no-image.png");

export default function PurchasedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data, isLoading } = usePurchasedProducts();

  const unredeemeds = data?.unredeemed ?? [];
  const rescued = data?.redeemed ?? [];

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-white">
      <Header />

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: insets.bottom + 16, paddingTop: insets.top }} showsVerticalScrollIndicator={false}>
        <View className="p-6 pt-2 gap-4">
          <View className="gap-3 mb-5">
            <Text className="font-interBold text-lg text-black mb-2">Produtos não resgatados</Text>
            {!isLoading && unredeemeds.length === 0 && (
              <Text className="text-center text-black opacity-55 font-inter">
                Você não possui produtos para resgatar.
              </Text>
            )}
            {unredeemeds.map((item, index) => (
              <Pressable
                key={`${item.orderId}-${index}`}
                className="flex-row items-center border border-gray-200 rounded-2xl p-3 gap-3 bg-white  active:opacity-50"
                onPress={() => router.push({
                  pathname: "/user/(private)/purchased/review-product",
                  params: { orderId: item.orderId }
                })}
              >
                <Image
                  className="w-14 h-14 rounded-xl"
                  source={item.imageUrl ? { uri: item.imageUrl } : NO_IMAGE}
                />
                <View className="flex-1">
                  <Text className="font-interBold text-base text-black">{item.productName}</Text>
                  <Text className="font-inter text-sm text-gray-500">Pedido {item.orderId}</Text>
                  {!!item.expirationDate && (
                    <Text className="font-interBold text-sm text-[#E07B00]">Válido até {formatDateBR(item.expirationDate)}</Text>
                  )}
                </View>
              </Pressable>
            ))}
          </View>

          <View className="gap-3">
            <Text className="font-interBold text-lg text-black mb-2">Produtos resgatados</Text>
            {!isLoading && rescued.length === 0 && (
              <Text className="text-center text-black opacity-55 font-inter">
                Você ainda não resgatou nenhum produto.
              </Text>
            )}
            {rescued.map((item, index) => (
              <View key={`${item.orderId}-${index}`} className="flex-row items-center border border-gray-200 rounded-2xl p-3 gap-3 bg-white">
                <Image
                  className="w-14 h-14 rounded-xl"
                  source={item.imageUrl ? { uri: item.imageUrl } : NO_IMAGE}
                  style={{ tintColor: "#888888" }}
                />
                <View className="flex-1">
                  <Text className="font-interBold text-base text-gray-400">{item.productName}</Text>
                  <Text className="font-inter text-sm text-gray-400">Pedido {item.orderId}</Text>
                  {!!item.redemptionDate && (
                    <Text className="font-inter text-sm text-gray-400">resgatado em {formatDateBR(item.redemptionDate)}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
