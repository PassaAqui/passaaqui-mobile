import { ScrollView, View, Text, Pressable, Image } from "react-native"
import { useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar";
import LogoIcon from "@/src/components/common/logoIcon";

export default function Index() {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    NavigationBar.setButtonStyleAsync("dark")
  })

  return (
    <ScrollView>
      <StatusBar style="dark" />
      <View className="flex-1 items-center h-screen p-10 pt-32 bg-[#F0F0F0]">

        <View className="absolute top-0 left-0 right-0 items-center justify-center p-10 z-10 flex-row">
          <Pressable className="absolute left-7 active:opacity-35">
            <Image source={require("@/assets/user/settings/back.png")} />
          </Pressable>
          <Text className="font-irishGrover text-black text-3xl">Perfil</Text>
        </View>




        

        <View className="items-center justify-center mb-14 gap-4">
          <LogoIcon />
          <View>
            <Text className="font-itim text-center text-2xl">David Cleyton</Text>
            <Text className="font-itim text-center text-lg opacity-65">davidcleyton101@gmail.com</Text>
          </View>
        </View>

        <View className="gap-10 w-full">
          <View className="bg-white p-5 gap-4 rounded-lg">
            <Text className="font-itim text-xl">Informações da conta</Text>
            <View className="gap-1">
              <Pressable className="flex-row items-center justify-between active:opacity-30 min-h-10">
                <Text className="font-itim text-lg opacity-75">Editar perfil</Text>
                <Image source={require("@/assets/user/settings/go.png")} />
              </Pressable>

              <Pressable className="flex-row items-center justify-between active:opacity-30 min-h-10">
                <Text className="font-itim text-lg opacity-75">Ver histórico de viagens</Text>
                <Image source={require("@/assets/user/settings/go.png")} />
              </Pressable>

              <Pressable className="flex-row items-center justify-between active:opacity-30 min-h-10">
                <Text className="font-itim text-lg opacity-75">Ver transações</Text>
                <Image source={require("@/assets/user/settings/go.png")} />
              </Pressable>
            </View>
          </View>

          <View className="bg-white p-5 gap-3 rounded-lg">
            <Text className="font-itim text-xl">Preferências</Text>
            <Pressable className="flex-row items-center justify-between active:opacity-30 min-h-10">
              <Text className="font-itim text-lg opacity-75">Modo escuro</Text>
              <Image source={require("@/assets/user/settings/go.png")} />
            </Pressable>

          </View>
        </View>

        <View style={{ bottom: insets.bottom - 8 }}  className="absolute bottom-0 left-0 flex-row items-center gap-1 p-10">
          <Image className="w-7 h-7" source={require("@/assets/user/settings/trash.png")} />
          <Text className="text-red-800 font-itim text-lg">Excluir conta</Text>
        </View>
      </View>
    </ScrollView>
  )
}