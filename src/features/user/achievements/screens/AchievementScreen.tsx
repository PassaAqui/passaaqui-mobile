import { ScrollView, View, Text, Pressable, Image, ActivityIndicator } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar";
import { Ionicons } from "@expo/vector-icons";
import WithoutSticker from "@/src/features/user/achievements/components/WithoutSticker";
import CompleteSticker from "@/src/features/user/achievements/components/CompleteSticker";
import { useAchievements } from "@/src/features/user/achievements/hooks/useAchievements";
import { useAchievementCategories } from "@/src/features/user/achievements/hooks/useAchievementCategories";
import { useTouristMe } from "@/src/features/user/auth/hooks/useTouristMe";

// A API devolve "TUDO" como a categoria que representa todas as conquistas.
// O valor serve só para comparar com o chip selecionado: quando ele é o
// escolhido, nenhum filtro é enviado, para a API devolver a lista inteira.
const ALL_CATEGORY_VALUE = "TUDO";

export default function AchievementScreen() {
  const insets = useSafeAreaInsets();

  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORY_VALUE);

  const { data: categories } = useAchievementCategories();
  const { data: achievements, isLoading, isError, refetch } = useAchievements(
    selectedCategory === ALL_CATEGORY_VALUE ? undefined : selectedCategory
  );
  const { data: tourist } = useTouristMe();

  useEffect(() => {
    NavigationBar.setButtonStyleAsync("dark");
  })

  const currentXp = tourist?.currentXP ?? 0;

  return (
    <View className="flex-1 bg-[#F4F1EA]">
      <StatusBar style="dark" />
      <Image source={require("@/assets/user/achievements/vertical-border.png")} className="absolute left-0 top-0 w-[4%] h-full" resizeMode="stretch" />
    
      <SafeAreaView edges={["top"]} className="flex-1 flex-row ">
        <Image source={require("@/assets/user/achievements/vertical-border.png")} className="w-[4%] h-full" resizeMode="stretch" />

        <View className="w-[96%] flex-1">
          <View className="items-center justify-center px-6 pb-3 gap-8" style={{ paddingTop: insets.top }}>
            <View className="flex flex-row items-center justify-between w-full">
              <Text className="interBold text-3xl flex-1">Olá, Viajante</Text>

              <View className="bg-[#3D2408] px-5 py-2 flex-row rounded-full gap-1 items-center justify-center shadow-lg shadow-black">
                <Text className="text-white font-interBold">{currentXp} XP</Text>
              </View>
            </View>

            <View className="w-full">
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row" contentContainerClassName="flex-row gap-2">
                {categories?.map((category) => (
                  <Pressable
                    key={category.value}
                    testID={`category-chip-${category.value}`}
                    onPress={() => setSelectedCategory(category.value)}
                    className={`${selectedCategory === category.value ? 'bg-[#D8D2C5]' : 'bg-[#E5DFD3]'} p-2 px-5 rounded-xl min-w-1/4 items-center justify-center`}
                  >
                    <Text className="text-black font-interBold">{category.label}</Text>  
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </View>

          <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: insets.bottom + 16 }} showsVerticalScrollIndicator={false}>
            <View className="items-center justify-center px-6 py-4 gap-8">
              {isLoading ? (
                <View className="items-center py-16">
                  <ActivityIndicator testID="achievements-loading" color="#8A6A3D" />
                </View>
              ) : isError ? (
                <View className="items-center py-16">
                  <Ionicons name="alert-circle-outline" size={48} color="#C9C2B4" />
                  <Text className="font-inter text-[#8A8A8A] mt-3 text-center">Não foi possível carregar as conquistas</Text>
                  <Pressable onPress={() => refetch()} className="mt-3 active:opacity-50">
                    <Text className="font-inter text-[#8A6A3D] text-sm">Tentar novamente</Text>
                  </Pressable>
                </View>
              ) : (achievements ?? []).length === 0 ? (
                <View className="items-center py-16">
                  <Ionicons name="ribbon-outline" size={48} color="#C9C2B4" />
                  <Text className="font-inter text-[#8A8A8A] mt-3 text-center">Nenhuma conquista disponível</Text>
                </View>
              ) : (
                <View className="w-full flex-row flex-wrap gap-5 items-center justify-center">
                  {(achievements ?? []).map((achievement) => {
                    if (!achievement.unlocked) {
                      return <WithoutSticker key={achievement.achievementId} title={achievement.name} description={achievement.description} />
                    }

                    return (
                      <CompleteSticker
                        key={achievement.achievementId}
                        achievement={achievement}
                        invertRotate={achievement.achievementId % 2 !== 0}
                      />
                    )
                  })}
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  )
}
