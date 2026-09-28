import { ScrollView, View, Text, Image, Pressable, TextInput } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Header from "@/src/features/user/shop/components/Header";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useMemo } from "react";
import { useLocalSearchParams } from "expo-router";
import { useReviewMedia } from "@/src/features/user/purchased/hooks/useReviewMedia";
import { usePurchasedProducts } from "@/src/features/user/purchased/hooks/usePurchasedProducts";
import { formatDateBR } from "@/src/features/user/purchased/utils/formatDate";

const NO_IMAGE = require("@/assets/user/map/tmp/no-image.png");

export default function ReviewProductScreen() {
  const insets = useSafeAreaInsets();
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const { photos, videos, maxPhotos, maxVideos, pickPhotos, pickVideos, removePhoto, removeVideo } = useReviewMedia();

  const { orderId } = useLocalSearchParams<{ orderId: string }>();

  const { data } = usePurchasedProducts();
  const product = useMemo(
    () => [...(data?.unredeemed ?? []), ...(data?.redeemed ?? [])].find((item) => item.orderId === orderId),
    [data, orderId]
  );

  if (!product) return null;

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-white">
      <Header />

      <KeyboardAwareScrollView
        bottomOffset={16}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 16, paddingTop: insets.top}}
        showsVerticalScrollIndicator={false}
      >
        <View className="p-6 gap-5">
          <View className="flex-row items-center border border-gray-200 rounded-2xl p-3 gap-3 bg-white">
            <Image
              className="w-14 h-14 rounded-xl"
              source={product.imageUrl ? { uri: product.imageUrl } : NO_IMAGE}
            />
            <View className="flex-1">
              <Text className="font-interBold text-base text-black">{product.productName}</Text>
              <Text className="font-inter text-sm text-gray-500">Pedido {product.orderId}</Text>
              {!!product.expirationDate && (
                <Text className="font-interBold text-sm text-[#E07B00]">Válido até {formatDateBR(product.expirationDate)}</Text>
              )}
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

            {photos.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-3">
                  {photos.map((photo) => (
                    <View key={photo.uri} className="relative">
                      <Image source={{ uri: photo.uri }} className="w-20 h-20 rounded-xl" />
                      <Pressable
                        onPress={() => removePhoto(photo.uri)}
                        className="absolute -top-2 -right-2 bg-white rounded-full p-1 border border-gray-200 active:opacity-70"
                      >
                        <Text className="text-red-600 text-sm font-interBold leading-none">✕</Text>
                      </Pressable>
                    </View>
                  ))}
                </View>
              </ScrollView>
            )}

            {videos.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-3">
                  {videos.map((video) => (
                    <View key={video.uri} className="relative">
                      <Image source={{ uri: video.uri }} className="w-20 h-20 rounded-xl" />
                      <View className="absolute inset-0 items-center justify-center">
                        <Text className="text-white text-lg">▶</Text>
                      </View>
                      <Pressable
                        onPress={() => removeVideo(video.uri)}
                        className="absolute -top-2 -right-2 bg-white rounded-full p-1 border border-gray-200 active:opacity-70"
                      >
                        <Text className="text-red-600 text-sm font-interBold leading-none">✕</Text>
                      </Pressable>
                    </View>
                  ))}
                </View>
              </ScrollView>
            )}

            <View className="flex-row gap-3">
              {photos.length < maxPhotos && (
                <Pressable
                  onPress={pickPhotos}
                  className="flex-1 border-2 border-dashed border-gray-300 rounded-2xl items-center justify-center py-6 gap-2 active:opacity-40"
                >
                  <Image source={require("@/assets/user/purchased/photo.png")} />
                  <Text className="font-inter text-base text-gray-600">Adicionar foto</Text>
                </Pressable>
              )}
              {videos.length < maxVideos && (
                <Pressable
                  onPress={pickVideos}
                  className="flex-1 border-2 border-dashed border-gray-300 rounded-2xl items-center justify-center py-10 gap-2 active:opacity-40"
                >
                  <Image source={require("@/assets/user/purchased/video.png")} />
                  <Text className="font-inter text-base text-gray-600">Adicionar vídeo</Text>
                </Pressable>
              )}
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
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}