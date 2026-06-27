import { ScrollView, View, Text, Image, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Header from "@/src/features/user/shop/components/Header";

const unredeemeds = [
  {
    id: 1,
    title: "Tapioca Clássica",
    pedido: "#A3F92",
    validade: "20/04/2026",
    img: "https://static.thenounproject.com/png/3674270-200.png",
  },
  {
    id: 2,
    title: "Tapioca Clássica",
    pedido: "#A3F92",
    validade: "20/04/2026",
    img: "https://static.thenounproject.com/png/3674270-200.png",
  },
];

const rescued = [
  {
    id: 3,
    title: "Vaso de Cerâmica",
    pedido: "#B7C21",
    data: "25/04/2026",
    img: "https://static.thenounproject.com/png/3674270-200.png",
  },
  {
    id: 4,
    title: "Tapioca Clássica",
    pedido: "#A3F92",
    data: "20/04/2026",
    img: "https://static.thenounproject.com/png/3674270-200.png",
  },
];

export default function PurchasedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-white">
      <Header />

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: insets.bottom + 16, paddingTop: insets.top }} showsVerticalScrollIndicator={false}>
        <View className="p-6 pt-2 gap-4">
          <View className="gap-3 mb-5">
            <Text className="font-interBold text-lg text-black mb-2">Produtos não resgatados</Text>
            {unredeemeds.map((item) => (
              <Pressable
                key={item.id}
                className="flex-row items-center border border-gray-200 rounded-2xl p-3 gap-3 bg-white  active:opacity-50"
                onPress={() => router.push({
                  pathname: "/user/purchased/review-product",
                  params: { id: item.id.toString() }
                })}
              >
                <Image className="w-14 h-14 rounded-xl" source={{ uri: item.img }} />
                <View className="flex-1">
                  <Text className="font-interBold text-base text-black">{item.title}</Text>
                  <Text className="font-inter text-sm text-gray-500">Pedido {item.pedido}</Text>
                  <Text className="font-interBold text-sm text-[#E07B00]">Válido até {item.validade}</Text>
                </View>
              </Pressable>
            ))}
          </View>

          <View className="gap-3">
            <Text className="font-interBold text-lg text-black mb-2">Produtos resgatados</Text>
            {rescued.map((item) => (
              <View key={item.id} className="flex-row items-center border border-gray-200 rounded-2xl p-3 gap-3 bg-white">
                <Image className="w-14 h-14 rounded-xl" source={{ uri: item.img }} style={{ tintColor: "#888888" }} /> 
                <View className="flex-1">
                  <Text className="font-interBold text-base text-gray-400">{item.title}</Text>
                  <Text className="font-inter text-sm text-gray-400">Pedido {item.pedido}</Text>
                  <Text className="font-inter text-sm text-gray-400">resgatado em {item.data}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}