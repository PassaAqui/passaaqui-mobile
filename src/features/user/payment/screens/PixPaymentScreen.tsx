import { ScrollView, View, Image, Text, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import * as ClipBoard from "expo-clipboard";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useOrderStore } from "@/src/stores/user/payment/orderStore";
import { useOrder } from "@/src/features/user/payment/hooks/useOrder";
import { useOrderSocket } from "@/src/features/user/payment/hooks/useOrderSocket";

export default function PixPaymentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();

  const storeOrder = useOrderStore((s) => s.order);
  const setOrder = useOrderStore((s) => s.setOrder);

  const needsFetch = !storeOrder || storeOrder.id !== orderId;
  const { data: fetchedOrder, isLoading } = useOrder(needsFetch ? orderId : undefined);

  useEffect(() => {
    if (fetchedOrder) setOrder(fetchedOrder);
  }, [fetchedOrder]);

  const order = needsFetch ? fetchedOrder : storeOrder;

  useOrderSocket(order?.id, (data) => {
    if (data.status === "PAID") {
      router.replace("/user/(private)/payment/payment-confirmed");
    }
  });

  const [timeLeft, setTimeLeft] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!order?.pixExpiresAt) return;
    const expiresAt = new Date(order.pixExpiresAt).getTime();

    const tick = () => {
      const diff = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setTimeLeft(diff);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [order?.pixExpiresAt]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const copyPixCode = async () => {
    if (!order) return;
    await ClipBoard.setStringAsync(order.pix);
    setCopied(true);
    setTimeout(() => setCopied(false), 7000);
  };

  if (isLoading || !order) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  const expired = order.status === "EXPIRED" || timeLeft === 0;

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-white">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: insets.bottom + 16 }} showsVerticalScrollIndicator={false}>
        <View className="items-center justify-center p-6 gap-5">
          <View className="flex-col items-center justify-center gap-4 mb-4">
            <Image className="w-8 h-8" source={require("@/assets/user/map/poi/shop/payment/hourglass.png")} />
            <View className="items-center justify-center flex-col">
              <Text className="font-interBold text-2xl text-green-700 text-center">Aguardando pagamento</Text>
              <Text className="font-inter text-center opacity-55">Finalize o PIX para confirmar seu pedido</Text>
            </View>
          </View>

          <View className="border border-gray-300 w-full rounded-xl px-4 py-12 items-center justify-center gap-3">
            <Image
              source={{ uri: `data:image/png;base64,${order.qrCodeBase64}` }}
              style={{ width: 200, height: 200 }}
              resizeMode="contain"
            />

            <Text className="font-inter text-center">Copie o código abaixo para pagar no app do seu banco:</Text>
            <View className="bg-gray-200 w-full p-4 border border-dashed border-gray-400 rounded-xl items-center">
              <Text className="opacity-70 font-inter text-center">{order.pix}</Text>
            </View>

            <Text className="font-inter text-center">
              O código expira em:{" "}
              <Text className={`font-interBold ${timeLeft <= 60 ? "text-red-500" : "text-black"}`}>
                {timeLeft > 0 ? formatTime(timeLeft) : "Expirado"}
              </Text>
            </Text>
          </View>

          <View className="w-full gap-2">
            <Pressable
              onPress={copyPixCode}
              disabled={expired}
              className={`${expired ? "bg-gray-400" : "bg-[#311e08]"} p-4 items-center justify-center rounded-xl active:opacity-70`}
            >
              <Text className="text-white font-interBold text-lg text-center">
                {expired ? "Código expirado" : copied ? "Copiado" : "Copiar código PIX"}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.push({
                pathname: "/user/(private)/shop/product",
                params: { id: order.productId },
              })}
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