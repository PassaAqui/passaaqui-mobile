import { ScrollView, View, Text, Image } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar";
import XpBar from "@/src/components/user/map/poi/shop/XpBar";
import { useEffect } from "react";

const products = [
  {id: 1, title: "Produto 1", description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit.", price: "10,00", xpRequired: 250},
  {id: 2, title: "Produto 2", description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit.", price: "35,00", xpRequired: 750},
  {id: 3, title: "Produto 3", description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit.", price: "10,00", xpRequired: 250},
  {id: 4, title: "Produto 4", description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit.", price: "35,00", xpRequired: 750},
  {id: 5, title: "Produto 5", description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit.", price: "10,00", xpRequired: 250},
  {id: 6, title: "Produto 6", description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit.", price: "35,00", xpRequired: 750},
]

const currentXp = 500;

export default function Shop() {
  useEffect(() => {
    NavigationBar.setButtonStyleAsync("dark");
  }, [])

  return (
    <ScrollView>
      <StatusBar style="dark" />

      <View className="flex-1 justify-center items-center w-full gap-3">
        <View className="bg-[#C4843A] w-full p-7 rounded-lg flex-row gap-3 items-center">
          <Image className="w-16 h-16" source={require("@/assets/user/map/poi/shop/coin.png")}/>
          <View>
            <Text className="font-itim text-white text-lg" adjustsFontSizeToFit>SEU SALDO DE XP</Text>
            <Text className="font-itim text-white text-lg" adjustsFontSizeToFit>1207 XP</Text>
          </View>
        </View>

        <View className="gap-3 flex-row flex-wrap items-center justify-center p-3">
          {products.map((product) => (
            <View key={product.id} className="border-2 border-[#EAAA6A] w-[47%] rounded-lg overflow-hidden">
              <Image className="w-full h-28 bg-gray-400" source={require("@/assets/user/map/tmp/no-image.png")} resizeMode="cover" />
              <View className="p-5 gap-3">
                <Text className="text-lg">{product.title}</Text>
                <Text>{product.description}</Text>

                <View className="flex-row gap-1 items-center">
                  <Image className="w-6 h-6" source={require("@/assets/user/map/poi/shop/coin.png")} />
                  <Text>R$ {product.price}</Text>
                </View>

                <View>
                  <XpBar currentXp={currentXp} xpRequired={product.xpRequired} />
                  <View>
                    <Text className="font-itim">{currentXp}/{product.xpRequired} XP</Text>
                    {/*<Image />*/}
                  </View>
                </View>
              </View>
            </View>
          ))}          
        </View>
      </View>
    </ScrollView>
  )
}