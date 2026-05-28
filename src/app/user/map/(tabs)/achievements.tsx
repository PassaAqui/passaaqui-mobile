import { ScrollView, View, Text, Image, Pressable } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar";
import WithoutSticker from "@/src/components/user/map/achievements/WithoutSticker";
import CompleteSticker from "@/src/components/user/map/achievements/CompleteSticker";

const filters: string[] = ["Tudo", "Gastronomia", "Cultura", "Passeios"];
const currentXp = 2450;

export default function Achievements() {
  const insets = useSafeAreaInsets();

  const [selectFilter, setSelectFilter] = useState<string>("Tudo");

  useEffect(() => {
    NavigationBar.setButtonStyleAsync("dark");
  })

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-[#F4F1EA]">
      <StatusBar style="dark" />

      <View className="items-center justify-center px-6 pb-3 gap-8" style={{ paddingTop: insets.top }}>
        <View className="flex flex-row items-center justify-between w-full">
          <Text className="interBold text-3xl flex-1">Olá, Viajante</Text>

          <View className="bg-[#3D2408] px-5 py-2 flex-row rounded-full gap-1 items-center justify-center">
            <Text className="text-white font-interBold">{currentXp} XP</Text>
          </View>
        </View>

        <View className="w-full">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row" contentContainerClassName="flex-row gap-2">
            {filters.map((filter) => (
              <Pressable
                key={filter}
                onPress={() => setSelectFilter(filter)}
                className={`${selectFilter === filter ? 'bg-[#D8D2C5]' : 'bg-[#E5DFD3]'} p-2 px-5 rounded-xl min-w-1/4 items-center justify-center`}
              >
                <Text className="text-black font-interBold">{filter}</Text>  
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: insets.bottom + 16 }} showsVerticalScrollIndicator={false}>
        <View className="items-center justify-center px-6 py-4 gap-8">
          <View className="w-full flex-row flex-wrap gap-5 items-center justify-center">
            <CompleteSticker />

            <WithoutSticker />
            <WithoutSticker />
            <WithoutSticker />
            <WithoutSticker />
            <WithoutSticker />
            <WithoutSticker />
            
            
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}