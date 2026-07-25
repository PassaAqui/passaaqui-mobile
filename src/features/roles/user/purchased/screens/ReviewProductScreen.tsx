import { ScrollView, View, Text, Image, Pressable, TextInput } from "react-native";
import Header from "@/src/features/roles/user/shop/components/Header";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";
import { useLocalSearchParams } from "expo-router";

export default function ReviewProductScreen() {
  const insets = useSafeAreaInsets();
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");

  const { id } = useLocalSearchParams<{ id: string }>();

  // Substituir por uma função pra pegar os dados do produto do ID acima quando conectar com o backend
  const product = {
    id: id,
    title: "Tapioca Clássica",
    pedido: "#A3F92",
    validade: "20/04/2026",
    img: "https://static.thenounproject.com/png/3674270-200.png",
  }

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-white">
      <Header />

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: insets.bottom + 16, paddingTop: insets.top}} showsVerticalScrollIndicator={false}>
        <View className="p-6 gap-5">
          <View className="flex-row items-center border border-gray-200 rounded-2xl p-3 gap-3 bg-white">
            <Image className="w-14 h-14 rounded-xl" source={{ uri: product.img }} />
            <View className="flex-1">
              <Text className="font-interBold text-base text-black">{product.title}</Text>
              <Text className="font-inter text-sm text-gray-500">{product.pedido}</Text>
              <Text className="font-interBold text-sm text-[#E07B00]">{product.validade}</Text>
            </View>
          </View>

          <View className="gap-3">
            <Text className="font-interBold text-lg text-black">Avalie o produto</Text>
            <View className="flex-row gap-5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Pressable key={star} onPress={() => setRating(star)} className="active:opacity-70">
                  <Text className={`text-4xl ${star <= rating ? "text-[#ffcd29]" : "text-gray-400"}`}>
                    {star <= rating ? "★" : "☆"}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View className="flex-col gap-3 mt-4">
            <Text className="font-interBold text-lg text-black">Adione imagens do produto</Text>
            <View className="flex-row gap-3">
              <Pressable className="flex-1 border-2 border-dashed border-gray-300 rounded-2xl items-center justify-center py-6 gap-2 active:opacity-40">
                <Image source={require("@/assets/user/purchased/photo.png")} />
                <Text className="font-inter text-base text-gray-600">Adicionar foto</Text>
              </Pressable>
              <Pressable className="flex-1 border-2 border-dashed border-gray-300 rounded-2xl items-center justify-center py-10 gap-2 active:opacity-40">
                <Image source={require("@/assets/user/purchased/video.png")} />
                <Text className="font-inter text-base text-gray-600">Adicionar vídeo</Text>
              </Pressable>
            </View>
          </View>

          <View className="flex-col gap-3 mt-4">
            <Text className="font-interBold text-lg text-black">Fale um pouco sobre o produto</Text>
            <TextInput
              className="border border-gray-200 rounded-2xl p-4 font-inter text-base text-gray-700 min-h-36"
              placeholder="Comente sobre o produto para ajudar outras pessoas a comprarem também"
              placeholderTextColor="#9CA3AF"
              multiline
              textAlignVertical="top"
              value={comment}
              onChangeText={setComment}
            />
          </View>

          <Pressable className="bg-[#EAAA6A] p-4 items-center justify-center rounded-2xl active:opacity-70 mt-2">
            <Text className="text-white font-interBold text-lg text-center">Adicionar avaliação</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}