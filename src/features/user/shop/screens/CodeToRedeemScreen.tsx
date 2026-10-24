import {
  ScrollView,
  View,
  Text,
  Image,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import * as ClipBoard from "expo-clipboard";
import { useRouter } from "expo-router";
import Header from "@/src/features/user/shop/components/Header";
import { usePendingOrder } from "@/src/features/user/payment/hooks/usePendingOrder";
import { useProductDetail } from "@/src/features/user/shop/hooks/products/useProductDetail";
import { buildQrCodeUri } from "@/src/features/user/payment/utils/qrCode";

const placeholderImage = require("@/assets/user/map/tmp/no-image.png");

function formatExpiration(value: string): string | null {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CodeToRedeemScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: pendingOrder, isLoading, isError, refetch } = usePendingOrder();
  const { data: product } = useProductDetail(pendingOrder?.productId);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;

    const timeout = setTimeout(() => setCopied(false), 7000);
    return () => clearTimeout(timeout);
  }, [copied]);

  if (isLoading) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-white">
        <Header />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator testID="pending-order-loading" size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-white">
        <Header />
        <View className="flex-1 items-center justify-center p-6 gap-4">
          <Text className="text-xl font-interBold text-center">
            Não foi possível carregar seu pagamento
          </Text>
          <Text className="opacity-55 font-inter text-center">
            Verifique sua conexão e tente novamente.
          </Text>
          <Pressable
            onPress={() => void refetch()}
            className="bg-[#3D2409] px-8 p-3 rounded-xl active:opacity-65"
          >
            <Text className="text-white font-interBold text-lg">
              Tentar novamente
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (!pendingOrder) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-white">
        <Header />
        <View className="flex-1 items-center justify-center p-6 gap-4">
          <Text className="text-xl font-interBold text-center">
            Nenhum pagamento pendente
          </Text>
          <Text className="opacity-55 font-inter text-center">
            Você não possui nenhum PIX aguardando pagamento.
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="bg-[#3D2409] px-8 p-3 rounded-xl active:opacity-65"
          >
            <Text className="text-white font-interBold text-lg">Voltar</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const expiresAt = pendingOrder.pixExpiresAt
    ? new Date(pendingOrder.pixExpiresAt).getTime()
    : null;
  const expired =
    expiresAt !== null && !Number.isNaN(expiresAt) && expiresAt <= Date.now();
  const expirationLabel = pendingOrder.pixExpiresAt
    ? formatExpiration(pendingOrder.pixExpiresAt)
    : null;

  const qrCodeUri = buildQrCodeUri(pendingOrder.qrCodeBase64);
  const productImage = product?.images?.[0];
  const imageSource = productImage ? { uri: productImage } : placeholderImage;

  const expirationText = expired
    ? "PIX expirado"
    : expirationLabel
      ? `Válido até ${expirationLabel}`
      : "Validade não informada";

  const copyPixCode = async () => {
    if (!pendingOrder.pix || expired) return;

    await ClipBoard.setStringAsync(pendingOrder.pix);
    setCopied(true);
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-white">
      <Header />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
      >
        <View className="items-center justify-center p-6 gap-6">
          <Text className="text-2xl font-interBold">PAGAMENTO PENDENTE</Text>

          <View className="w-full border border-gray-400 flex-col rounded-xl pt-4">
            <View className="w-full flex-row items-center pb-3 px-4 gap-3">
              <Image
                testID="product-image"
                className="w-20 h-20 rounded-lg"
                source={imageSource}
              />
              <View className="flex-col flex-1">
                <Text
                  className="text-lg font-interBold"
                  adjustsFontSizeToFit
                  numberOfLines={2}
                >
                  {pendingOrder.productName}
                </Text>
                <Text
                  className="opacity-75 font-inter"
                  adjustsFontSizeToFit
                  numberOfLines={1}
                >
                  {pendingOrder.shopkeeperName}
                </Text>
                <Text
                  className={`font-interBold ${
                    expired ? "text-red-500" : "text-[#C4843A]"
                  }`}
                  adjustsFontSizeToFit
                  numberOfLines={1}
                >
                  {expirationText}
                </Text>
              </View>
            </View>

            <View className="bg-[#FEF3E2] w-full items-center justify-center border-t-2 border-[#F0D49A] p-4 gap-3 rounded-b-xl">
              <Text className="text-[#A86830] font-interBold">
                PAGUE COM PIX
              </Text>

              {qrCodeUri ? (
                <Image
                  testID="pix-qr-code"
                  source={{ uri: qrCodeUri }}
                  style={{ width: 200, height: 200 }}
                  resizeMode="contain"
                />
              ) : (
                <View
                  style={{ width: 200, height: 200 }}
                  className="items-center justify-center"
                >
                  <Text className="font-inter text-center opacity-55">
                    QR Code indisponível
                  </Text>
                </View>
              )}

              <Text className="text-center text-[#7A5C1E] font-inter">
                Escaneie o QR Code ou copie o código abaixo no app do seu banco.
              </Text>

              <View className="bg-white w-full items-center p-3 border border-dashed border-[#C4843A] rounded-xl">
                <Text className="text-center font-inter text-xs" selectable>
                  {pendingOrder.pix}
                </Text>
              </View>

              <Text className="text-center text-[#7A5C1E] font-inter">
                Valor a pagar:{" "}
                <Text className="font-interBold text-lg">
                  R${" "}
                  {pendingOrder.totalAmount.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </Text>
              </Text>

              <View className="flex-row gap-3 w-full items-center justify-center p-2">
                <Pressable
                  testID="copy-pix-button"
                  onPress={copyPixCode}
                  disabled={expired}
                  className={`${
                    expired ? "bg-gray-400" : "bg-[#3D2409]"
                  } p-3 px-2 flex-1 rounded-xl items-center justify-center active:opacity-60`}
                >
                  <Text className="text-white text-center font-interBold text-base">
                    {expired
                      ? "PIX expirado"
                      : copied
                        ? "Copiado"
                        : "Copiar código PIX"}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => router.back()}
                  className="bg-white border border-[#C8B89A] p-3 px-2 flex-1 rounded-xl items-center justify-center active:opacity-40"
                >
                  <Text className="text-center text-black font-interBold text-base">
                    Fechar
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
