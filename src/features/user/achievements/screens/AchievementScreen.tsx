import { ScrollView, View, Text, Pressable, Image } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar";
import WithoutSticker from "@/src/features/user/achievements/components/WithoutSticker";
import CompleteSticker from "@/src/features/user/achievements/components/CompleteSticker";

const filters: string[] = ["Tudo", "Gastronomia", "Cultura", "Passeios"];
const currentXp = 2450;

// Temporario enquanto o back n ta pronto
const stickers = [
  {id: 1, complete: true, img: "https://www.gov.br/turismo/pt-br/assuntos/noticias/historia-e-natureza-no-passeio-pelo-rio-timbo-em-paulista-pe/29.08.22_PaulistsPECarlosQueiroz.jpg/@@images/812978df-6147-41ad-98fa-533fc4145042.jpeg", title: "Rio Timbó"},
  {id: 2, complete: false},
  {id: 3, complete: false},
  {id: 4, complete: false},
  {id: 5, complete: false},
  {id: 6, complete: false},
  {id: 7, complete: false},
  {id: 8, complete: false},
  {id: 9, complete: false}
]

export default function AchievementScreen() {
  const insets = useSafeAreaInsets();

  const [selectFilter, setSelectFilter] = useState<string>("Tudo");

  useEffect(() => {
    NavigationBar.setButtonStyleAsync("dark");
  })

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
                {stickers.map((sticker) => {
                  if (!sticker.img || !sticker.title) {
                    return <WithoutSticker key={sticker.id} />
                  }

                  return (
                    <CompleteSticker 
                      key={sticker.id} 
                      id={sticker.id}
                      image={sticker.img} 
                      title={sticker.title} 
                      invertRotate={sticker.id % 2 != 0 && sticker.complete} 
                    />
                  )
                })}
              </View>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  )
}