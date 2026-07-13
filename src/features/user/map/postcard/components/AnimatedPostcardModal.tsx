import { useEffect, useState } from "react";
import { View, Text, Pressable, Modal, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
  Easing
} from "react-native-reanimated";

import PostcardFront from "@/src/features/user/map/postcard/components/PostcardFront";
import PostcardBack from "@/src/features/user/map/postcard/components/PostcardBack";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface PostcardModalProps {
  visible: boolean;
  onClose: () => void;
  cityImage: string;
  cityName: string;
  chronicle: string;
}

export default function AnimatedPostcardModal({
  visible,
  onClose,
  cityImage,
  cityName,
  chronicle,
}: PostcardModalProps) {
  const [canFlip, setCanFlip] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(visible);

  const translateY = useSharedValue(SCREEN_HEIGHT);
  const scale = useSharedValue(0.92);
  const opacity = useSharedValue(0);
  const flipRotation = useSharedValue(0); // 0 = frente | 180 = verso

  useEffect(() => {
    if (visible) {
      setIsModalVisible(true);
      setCanFlip(false);
      flipRotation.value = 0;

      translateY.value = SCREEN_HEIGHT * 0.35;
      scale.value = 0.92;
      opacity.value = 0;

      const entryEasing = Easing.out(Easing.cubic);

      opacity.value = withTiming(1, { duration: 220, easing: entryEasing });
      translateY.value = withTiming(0, { duration: 280, easing: entryEasing });
      scale.value = withTiming(1, { duration: 280, easing: entryEasing }, (finished) => {
        if (finished) {
          runOnJS(setCanFlip)(true);
        }
      });
    } else {
      opacity.value = withTiming(0, { duration: 150 });
      translateY.value = withTiming(SCREEN_HEIGHT * 0.35, { duration: 200 }, (finished) => {
        if (finished) {
          runOnJS(setIsModalVisible)(false);
        }
      });
    }
  }, [visible]);

  const handleFlip = () => {
    if (!canFlip) return;
    const target = flipRotation.value === 0 ? 180 : 0;
    flipRotation.value = withTiming(target, { duration: 450, easing: Easing.inOut(Easing.quad) });
  };

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  const frontFaceStyle = useAnimatedStyle(() => {
    const rotateY = `${flipRotation.value}deg`;
    const faceOpacity = interpolate(
      flipRotation.value,
      [0, 89, 90, 180],
      [1, 1, 0, 0],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ perspective: 1200 }, { rotateY }],
      opacity: faceOpacity,
    };
  });

  const backFaceStyle = useAnimatedStyle(() => {
    const rotateY = `${flipRotation.value - 180}deg`;
    const faceOpacity = interpolate(
      flipRotation.value,
      [0, 90, 91, 180],
      [0, 0, 1, 1],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ perspective: 1200 }, { rotateY }],
      opacity: faceOpacity,
    };
  });

  if (!isModalVisible) return null;

  return (
    <Modal transparent animationType="none" visible={isModalVisible} onRequestClose={() => {}}>
      <View className="flex-1 bg-black/60 items-center justify-center px-8">
        <Animated.View style={containerStyle} className="w-full aspect-[3/4] max-w-sm">
          <Pressable onPress={handleFlip} className="flex-1">
            <View className="flex-1">
              <Animated.View
                style={[
                  { backfaceVisibility: "hidden", position: "absolute", width: "100%", height: "100%" },
                  frontFaceStyle,
                ]}
              >
                <PostcardFront cityImage={cityImage} cityName={cityName} />
              </Animated.View>

              <Animated.View
                style={[
                  { backfaceVisibility: "hidden", position: "absolute", width: "100%", height: "100%" },
                  backFaceStyle,
                ]}
              >
                <PostcardBack cityImage={cityImage} cityName={cityName} chronicle={chronicle} />
              </Animated.View>
            </View>
          </Pressable>

          <Pressable onPress={onClose} className="absolute -top-4 -right-4 w-9 h-9 bg-[#F4F1EA] rounded-full items-center justify-center shadow-md active:opacity-60">
            <Text className="font-itim text-lg text-gray-700">✕</Text>
          </Pressable>
        </Animated.View>

        {canFlip && (
          <Text className="font-itim text-white/75 text-base underline mt-6">Toque no cartão para virar</Text>
        )}
      </View>
    </Modal>
  );
}