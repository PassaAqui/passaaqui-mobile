import { View, Image, Pressable, ScrollView, NativeSyntheticEvent, NativeScrollEvent, useWindowDimensions } from "react-native";
import { useState, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import ImageViewing from "react-native-image-viewing";

interface ProductImageCarouselProps {
  images: string[];
}

export function ProductImageCarousel({ images }: ProductImageCarouselProps) {
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fullscreenVisible, setFullscreenVisible] = useState(false);

  const displayImages = images.length > 0 ? images : [];
  const CARD_HEIGHT = 224; // h-56 equivalente (56 * 4)

  const goToIndex = (index: number) => {
    const clamped = Math.max(0, Math.min(index, displayImages.length - 1));
    scrollRef.current?.scrollTo({ x: clamped * width, animated: true });
    setCurrentIndex(clamped);
  };

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentIndex(newIndex);
  };

  if (displayImages.length === 0) {
    return (
      <Image
        className="w-full border border-gray-300"
        style={{ height: CARD_HEIGHT }}
        source={require("@/assets/user/map/tmp/no-image.png")}
        resizeMode="cover"
      />
    );
  }

  return (
    <View className="w-full relative">
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
      >
        {displayImages.map((uri, index) => (
          <Pressable key={uri + index} onPress={() => setFullscreenVisible(true)} style={{ width }}>
            <Image
              className="border border-gray-300"
              style={{ width, height: CARD_HEIGHT }}
              source={{ uri }}
              resizeMode="cover"
            />
          </Pressable>
        ))}
      </ScrollView>

      {displayImages.length > 1 && (
        <>
          {currentIndex > 0 && (
            <Pressable
              onPress={() => goToIndex(currentIndex - 1)}
              className="absolute left-2 top-1/2 -translate-y-4 bg-black/40 rounded-full p-2"
            >
              <Ionicons name="chevron-back" size={18} color="white" />
            </Pressable>
          )}
          {currentIndex < displayImages.length - 1 && (
            <Pressable
              onPress={() => goToIndex(currentIndex + 1)}
              className="absolute right-2 top-1/2 -translate-y-4 bg-black/40 rounded-full p-2"
            >
              <Ionicons name="chevron-forward" size={18} color="white" />
            </Pressable>
          )}
        </>
      )}

      {displayImages.length > 1 && (
        <View className="absolute bottom-3 left-0 right-0 flex-row justify-center gap-1.5">
          {displayImages.map((_, index) => (
            <View
              key={index}
              className={`w-1.5 h-1.5 rounded-full ${index === currentIndex ? "bg-white" : "bg-white/50"}`}
            />
          ))}
        </View>
      )}

      <ImageViewing
        images={displayImages.map((uri) => ({ uri }))}
        imageIndex={currentIndex}
        visible={fullscreenVisible}
        onRequestClose={() => setFullscreenVisible(false)}
        onImageIndexChange={setCurrentIndex}
        swipeToCloseEnabled
        doubleTapToZoomEnabled
      />
    </View>
  );
}