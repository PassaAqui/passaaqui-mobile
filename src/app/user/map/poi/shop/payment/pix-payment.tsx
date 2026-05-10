import { ScrollView, View, Image, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar";
import { useEffect, useState, useRef } from "react";
import QRCode from "react-native-qrcode-svg";
import * as ClipBoard from "expo-clipboard";
import { useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import { products } from "@/src/constants/user/map/poi/shop/products";

export default function PixPayment() {
  const { id, discount } = useLocalSearchParams<{ id: string, discount: string }>();
  const product = products.find(p => p.id === Number(id));
  
  if (!product) return null;

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const TIMER_DURATION = 5 * 60;
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [paymentData, setPaymentData] = useState(() => JSON.stringify({
    orderId: "123456",
    amount: 25,
    currency: "BRL",
    token: Date.now()
  }))
  const [qrSize, setQrSize] = useState<number>(200);
  const [pixCode, setPixCode] = useState<string>("dasdjsabjasdhj837174898412JSIFJASHFASUFABFJN8721478164BJfjdhfas8B432BJNFDW8bds867FNOh78ft32n")
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    NavigationBar.setButtonStyleAsync("dark");
  }, [])

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current!);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const generateNewCode = () => {
    clearInterval(intervalRef.current!);

    setPaymentData(JSON.stringify({
      orderId: "123456",
      amount: 25,
      currency: "BRL",
      token: Date.now()
    }));

    setTimeLeft(TIMER_DURATION);
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const copyPixCode = async () => {
    await ClipBoard.setStringAsync(pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 7000);
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-white">
      <StatusBar style="dark" />

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: insets.bottom + 16 }} showsVerticalScrollIndicator={false}>
        <View className="items-center justify-center p-6 gap-5">
          <View className="flex-col items-center justify-center gap-4 mb-4">
            <Image className="w-8 h-8" source={require("@/assets/user/map/poi/shop/payment/hourglass.png")} />
            <View className="items-center justify-center flex-col">
              <Text className="font-interBold text-2xl text-green-700 text-center">Aguardando pagamento</Text>
              <Text className="font-inter text-center opacity-55">Finalize o PIX para confirmar seu pedido</Text>
            </View>
          </View>

          <View
            className="border border-gray-300 w-full rounded-xl px-4 py-12 items-center justify-center gap-3"
            onLayout={e => {
              const { width } = e.nativeEvent.layout;
              setQrSize(Math.min(width - 64, 200));
            }}
          >
            <QRCode
              value={paymentData}
              size={qrSize}
              color="#000"
              backgroundColor="#fff"
            />

            <Text className="font-inter text-center">Copie o código abaixo para pagar no app do seu banco:</Text>
            <View className="bg-gray-200 w-full p-4 border border-dashed border-gray-400 rounded-xl items-center">
              <Text className="opacity-70 font-inter text-center">{pixCode}</Text>
            </View>

            <Text className="font-inter text-center">O código expira em:{" "}
              <Text className={`font-interBold ${timeLeft <= 60 ? "text-red-500" : "text-black"}`}>
                {timeLeft > 0 ? formatTime(timeLeft) : "Expirado"}
              </Text>
            </Text>
          </View>

          <View className="w-full gap-2">
            <Pressable
              onPress={timeLeft === 0 ? generateNewCode : copyPixCode}
              className={`${timeLeft === 0 ? 'bg-red-800' : 'bg-[#311e08]'} p-4 items-center justify-center rounded-xl active:opacity-70`}
            >
              <Text className="text-white font-interBold text-lg text-center">{
              timeLeft === 0
                ? "Gerar novo código"
                : copied ? "Copiado"
                : "Copiar código PIX"
              }
            </Text>
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