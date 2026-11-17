import { Pressable, Text, View, useWindowDimensions } from "react-native";
import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { touristTutorialSteps } from "./tutorialConfig";
import { useTouristTutorial } from "./TutorialContext";
import SkipTutorialModal from "./SkipTutorialModal";

export default function TutorialOverlay() {
  const { active, stepIndex, next, skip } = useTouristTutorial();
  const [showSkipConfirmation, setShowSkipConfirmation] = useState(false);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const step = touristTutorialSteps[stepIndex];
  const isSimulationStep = step?.id === "simulation";
  const isShopStep = step?.id === "shop";

  if (!active || !step) return null;

  return (
    <>
      <View className="absolute inset-0 z-50" pointerEvents="box-none">
        {isSimulationStep && (
          <>
            <View className="absolute inset-0 bg-black/45" pointerEvents="none" />
            <View
              className="absolute rounded-xl border-4 border-[#FFD166]"
              style={{ top: 76, right: 10, width: Math.min(width * 0.42, 150), height: 56 }}
              pointerEvents="none"
            />
            <View
              className="absolute rounded-xl bg-[#3D2408] px-3 py-2"
              style={{ top: 138, right: 18, width: Math.min(width * 0.55, 210) }}
              pointerEvents="none"
            >
              <Text className="text-center font-interBold text-sm text-white">Toque aqui para simular</Text>
            </View>
          </>
        )}
        {isShopStep && (
          <View
            className="absolute rounded-xl border-4 border-[#FFD166]"
            style={{ bottom: insets.bottom + 6, left: width * 0.2 + 4, width: width * 0.2 - 8, height: 62 }}
            pointerEvents="none"
          />
        )}
        <View
          className="absolute left-4 right-4 rounded-2xl border-2 border-[#EAAA6A] bg-white p-5 shadow-lg"
          style={{ bottom: Math.max(insets.bottom + (isShopStep ? 92 : 20), 28), maxWidth: Math.min(width - 32, 440), alignSelf: "center" }}
          pointerEvents="auto"
        >
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="font-interBold text-sm text-[#A86830]">GUIA RÁPIDO</Text>
            <Text className="font-interBold text-sm text-[#6B625A]">{stepIndex + 1}/{touristTutorialSteps.length}</Text>
          </View>

          <Text className="font-itim text-3xl text-[#3D2408]">{step.title}</Text>
          <Text className="mt-2 font-inter text-base leading-6 text-[#3D2408]">{step.description}</Text>

          <View className="mt-5 flex-row items-center justify-between gap-3">
            <Pressable
              onPress={() => setShowSkipConfirmation(true)}
              accessibilityRole="button"
              accessibilityLabel="Pular tutorial"
              className="min-h-[48px] min-w-[72px] items-center justify-center rounded-lg px-3"
            >
              <Text className="font-interBold text-base text-[#6B625A]">Pular</Text>
            </Pressable>
            {step.id === "product" ? (
              <Pressable
                onPress={next}
                accessibilityRole="button"
                accessibilityLabel={step.cta}
                className="min-h-[48px] flex-1 items-center justify-center rounded-lg bg-[#EAAA6A] px-5 active:opacity-70"
              >
                <Text className="font-interBold text-base text-white">{step.cta}</Text>
              </Pressable>
            ) : (
              <View className="min-h-[48px] flex-1 flex-row items-center justify-center rounded-lg bg-[#FFF7ED] px-4">
                <View className="mr-2 h-2.5 w-2.5 rounded-full bg-[#EAAA6A]" />
                <Text className="text-center font-interBold text-sm text-[#A86830]">Aguardando sua ação…</Text>
              </View>
            )}
          </View>
        </View>
      </View>
      <SkipTutorialModal
        visible={showSkipConfirmation}
        onCancel={() => setShowSkipConfirmation(false)}
        onConfirm={() => {
          setShowSkipConfirmation(false);
          skip();
        }}
      />
    </>
  );
}
