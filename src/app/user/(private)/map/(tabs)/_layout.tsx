import { Tabs } from "expo-router";
import { useFonts } from "expo-font";
import { useRouter } from "expo-router";
import { IrishGrover_400Regular } from "@expo-google-fonts/irish-grover";
import { Itim_400Regular } from "@expo-google-fonts/itim";
import { Inter_400Regular, Inter_700Bold, Inter_400Regular_Italic } from "@expo-google-fonts/inter"
import { StatusBar } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar";
import { Image } from "react-native";
import "@/global.css";
import { useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/src/services/queryClient";

export default function TabLayout() {
  const router = useRouter();

  let [fontsLoaded] = useFonts({
    IrishGrover_400Regular,
    Itim_400Regular,
    Inter_400Regular,
    Inter_700Bold,
    Inter_400Regular_Italic
  });

  useEffect(() => {
    NavigationBar.setButtonStyleAsync("dark");
  })
  
  if (!fontsLoaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="dark" />

      <Tabs screenOptions={{ tabBarActiveTintColor: "black", headerShown: false }}>
          <Tabs.Screen
            name="index"
            options={{
              title: "Explorar",
              tabBarIcon: ({ focused }: { focused: boolean }) => (
                <Image
                  source={require("@/assets/user/map/map-icon.png")}
                  className="w-8 h-8"
                  style={{ resizeMode: "contain", opacity: focused ? 1 : 0.5 }}
                />
              )
            }}
          />

          <Tabs.Screen
            name="shop"
            options={{
              title: "Loja",
              tabBarIcon: ({ focused }: { focused: boolean }) => (
                <Image
                  source={require("@/assets/user/map/poi/shop/shop-icon.png")}
                  className="w-8 h-8"
                  style={{ resizeMode: "contain", opacity: focused ? 1 : 0.5 }}
                />
              )
            }}
          />

          <Tabs.Screen
            name="achievements"
            options={{
              title: "Conquistas",
              tabBarIcon: ({ focused }: { focused: boolean }) => (
                <Image
                  source={require("@/assets/user/map/achievements.png")}
                  className="w-8 h-8"
                  style={{ resizeMode: "contain", opacity: focused ? 1 : 0.5 }}
                />
              )
            }}
          />

          <Tabs.Screen
            name="purchased"
            options={{
              title: "Comprados",
              tabBarIcon: ({ focused }: { focused: boolean }) => (
                <Image
                  source={require("@/assets/user/map/tabs/purchased.png")}
                  className="w-8 h-8"
                  style={{ resizeMode: "contain", opacity: focused ? 1 : 0.5 }}
                />
              )
            }}
          />

          <Tabs.Screen
            name="settings"
            options={{
              title: "Configurações",
              tabBarIcon: ({ focused }: { focused: boolean }) => (
                <Image
                  source={require("@/assets/user/map/menu.png")}
                  className="w-8 h-8"
                  style={{ resizeMode: "contain", opacity: focused ? 1 : 0.5 }}
                />
              )
            }}
            /*
            listeners={{
              tabPress: (e) => {
                e.preventDefault();
                router.push("/user/settings");
              }
            }}
            */ /* Esse listeners tava aqui porque antes eu redirecionava para uma outra tela quando eu ainda estava usando a pasta app para tudo (criação de telas, componetens próprios) */
          />
      </Tabs>
    </QueryClientProvider>
  );
}

