import { ScrollView, View, Text, Image, Pressable, TextInput, ActivityIndicator } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Ionicons } from "@expo/vector-icons";
import Header from "@/src/features/user/shop/components/Header";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useMemo } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useReviewMedia } from "@/src/features/user/purchased/hooks/useReviewMedia";
import { usePurchasedProducts } from "@/src/features/user/purchased/hooks/usePurchasedProducts";
import { useCreateReview } from "@/src/features/user/purchased/hooks/useCreateReview";
import { formatDateBR } from "@/src/features/user/purchased/utils/formatDate";

const NO_IMAGE = require("@/assets/user/map/tmp/no-image.png");

const MAX_COMMENT_LENGTH = 1000;

export default function ReviewProductScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [ratingError, setRatingError] = useState<string>("");
  const [mediaError, setMediaError] = useState<string>("");
  const [commentError, setCommentError] = useState<string>("");
  const { photos, videos, maxPhotos, maxVideos, pickPhotos, pickVideos, removePhoto, removeVideo } = useReviewMedia();

  const handlePickPhotos = () => { setMediaError(""); pickPhotos(); };
  const handlePickVideos = () => { setMediaError(""); pickVideos(); };
  const handleRemovePhoto = (uri: string) => { setMediaError(""); removePhoto(uri); };
  const handleRemoveVideo = (uri: string) => { setMediaError(""); removeVideo(uri); };

  const { orderId } = useLocalSearchParams<{ orderId: string }>();

  const { data } = usePurchasedProducts();
  const product = useMemo(
    () => [...(data?.unredeemed ?? []), ...(data?.redeemed ?? [])].find((item) => item.orderId === orderId),
    [data, orderId]
  );

  const { mutate, isPending, isError } = useCreateReview();

  function handleSubmit() {
    let valid = true;

    if (rating < 1) {
      setRatingError("Selecione uma nota de 1 a 5.");
      valid = false;
    }

    if (photos.length === 0 && videos.length === 0) {
      setMediaError("Envie ao menos uma foto ou um vídeo.");
      valid = false;
    }

    if (comment.trim().length > MAX_COMMENT_LENGTH) {
      setCommentError(`O comentário deve ter no máximo ${MAX_COMMENT_LENGTH} caracteres.`);
      valid = false;
    }

    if (!valid || !orderId) return;

    mutate(
      { productId: orderId, rating, comment, photos, videos },
      { onSuccess: () => router.back() }
    );
  }

  if (!product || !orderId) return null;

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
                <Pressable key={star} onPress={() => { setRating(star); setRatingError(""); }} className="active:opacity-70">
                  <Text className={`text-4xl ${star <= rating ? "text-[#ffcd29]" : "text-gray-400"}`}>
                    {star <= rating ? "★" : "☆"}
                  </Text>
                </Pressable>
              ))}
            </View>
            {!!ratingError && <Text className="text-xs text-red-500 font-inter">{ratingError}</Text>}
          </View>

          <View className="flex-col gap-3 mt-4">
            <Text className="font-interBold text-lg text-black">Adicione imagens do produto</Text>

            {photos.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-3">
                  {photos.map((photo) => (
                    <View key={photo.uri} className="relative">
                      <Image source={{ uri: photo.uri }} className="w-20 h-20 rounded-xl" />
                      <Pressable
                        onPress={() => handleRemovePhoto(photo.uri)}
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
                        onPress={() => handleRemoveVideo(video.uri)}
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
                  onPress={handlePickPhotos}
                  className="flex-1 border-2 border-dashed border-gray-300 rounded-2xl items-center justify-center py-6 gap-2 active:opacity-40"
                >
                  <Image source={require("@/assets/user/purchased/photo.png")} />
                  <Text className="font-inter text-base text-gray-600">Adicionar foto</Text>
                </Pressable>
              )}
              {videos.length < maxVideos && (
                <Pressable
                  onPress={handlePickVideos}
                  className="flex-1 border-2 border-dashed border-gray-300 rounded-2xl items-center justify-center py-10 gap-2 active:opacity-40"
                >
                  <Image source={require("@/assets/user/purchased/video.png")} />
                  <Text className="font-inter text-base text-gray-600">Adicionar vídeo</Text>
                </Pressable>
              )}
            </View>
            {!!mediaError && <Text className="text-xs text-red-500 font-inter">{mediaError}</Text>}
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
              onChangeText={(text) => { setComment(text); setCommentError(""); }}
            />
            {!!commentError && <Text className="text-xs text-red-500 font-inter">{commentError}</Text>}
          </View>

          {isError && (
            <View className="bg-red-50 border border-red-200 rounded-xl p-4 flex-row gap-3">
              <Ionicons name="close-circle" size={21} color="#DC2626" />
              <Text className="text-sm text-red-600 font-inter flex-1">
                Não foi possível enviar a avaliação. Tente novamente.
              </Text>
            </View>
          )}

          <Pressable
            onPress={handleSubmit}
            disabled={isPending}
            className="bg-[#EAAA6A] p-4 items-center justify-center rounded-2xl active:opacity-70 mt-2 flex-row gap-2"
            style={{ opacity: isPending ? 0.6 : 1 }}
          >
            {isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-interBold text-lg text-center">Adicionar avaliação</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}