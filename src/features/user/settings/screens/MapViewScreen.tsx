import { useState } from "react";
import { ActivityIndicator, Pressable, Switch, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import SettingsHeader from "@/src/features/user/settings/components/SettingsHeader";
import { useTouristMe } from "@/src/features/user/auth/hooks/useTouristMe";
import { useUpdateMapView } from "@/src/features/user/settings/hooks/useUpdateMapView";
import type { MapView } from "@/src/features/user/auth/services/touristService";

export default function MapViewScreen() {
  const insets = useSafeAreaInsets();
  const { data: tourist, isLoading } = useTouristMe();
  const mutation = useUpdateMapView();
  const [selected, setSelected] = useState<MapView | null>(null);
  const current = selected ?? tourist?.mapView ?? "3D";

  const save = () => {
    mutation.mutate(current, { onSuccess: () => router.back() });
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-[#F0F0F0]">
      <SettingsHeader title="Visualização do mapa" />
      <View className="flex-1 px-6 pt-24">
        <View className="bg-white rounded-lg p-5 gap-5">
          <View>
            <Text className="font-itim text-xl">Alterar visualização do mapa</Text>
            <Text className="font-inter text-sm opacity-60 mt-2">
              Escolha como o mapa deve ser exibido.
            </Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="font-itim text-lg">{current === "3D" ? "Modo 3D" : "Modo 2D"}</Text>
            <Switch
              value={current === "3D"}
              onValueChange={(value) => setSelected(value ? "3D" : "2D")}
              trackColor={{ false: "#C9C9C9", true: "#EAAA6A" }}
              thumbColor="#FFFFFF"
              disabled={isLoading || mutation.isPending}
            />
          </View>
        </View>
        <Pressable
          onPress={save}
          disabled={isLoading || mutation.isPending}
          className="mt-auto bg-[#EAAA6A] rounded-lg py-4 items-center active:opacity-70"
        >
          {mutation.isPending ? <ActivityIndicator color="#FFFFFF" /> : <Text className="font-itim text-xl text-white">Salvar</Text>}
        </Pressable>
        <View style={{ height: insets.bottom }} />
      </View>
    </SafeAreaView>
  );
}
