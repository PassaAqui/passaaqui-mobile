import { ScrollView, View, Text, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import SettingsHeader from "@/src/features/user/settings/components/SettingsHeader";
import TravelHistoryMonthSection from "@/src/features/user/settings/components/TravelHistoryMonthSection";
import { useTravelHistory } from "@/src/features/user/settings/hooks/useTravelHistory";
import { groupByMonth } from "@/src/features/user/settings/utils/groupByMonth";

export default function TravelHistoryScreen() {
  const insets = useSafeAreaInsets();

  const { data: history, isLoading, isError, refetch } = useTravelHistory();
  const groups = groupByMonth(history ?? []);

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-white">
      <SettingsHeader title="Histórico" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 16, paddingTop: insets.top + 64 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="p-6 pt-2 gap-4">
          {isLoading ? (
            <View className="items-center py-16">
              <ActivityIndicator testID="travel-history-loading" color="#8A6A3D" />
            </View>
          ) : isError ? (
            <View className="items-center py-16">
              <Ionicons name="alert-circle-outline" size={48} color="#C9C2B4" />
              <Text className="font-inter text-[#8A8A8A] mt-3 text-center">
                Não foi possível carregar o histórico
              </Text>
              <Pressable onPress={() => refetch()} className="mt-3 active:opacity-50">
                <Text className="font-inter text-[#8A6A3D] text-sm">Tentar novamente</Text>
              </Pressable>
            </View>
          ) : groups.length === 0 ? (
            <Text className="text-center text-black opacity-55 font-inter">
              Você ainda não visitou nenhum local.
            </Text>
          ) : (
            groups.map((group) => (
              <TravelHistoryMonthSection key={group.label} {...group} />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}