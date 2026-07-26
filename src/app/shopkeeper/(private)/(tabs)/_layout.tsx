import { Tabs } from "expo-router";
import { useFonts } from "expo-font";
import { IrishGrover_400Regular } from "@expo-google-fonts/irish-grover";
import { Itim_400Regular } from "@expo-google-fonts/itim";
import { Inter_400Regular, Inter_700Bold, Inter_400Regular_Italic } from "@expo-google-fonts/inter"
import { StatusBar } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar";
import "@/global.css";
import { useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/src/services/queryClient";

export default function TabLayout() {
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
              title: "Início",
              tabBarIcon: ({ focused }: { focused: boolean }) => (
                <Ionicons name="home" size={20} color="#555" style={{ opacity: focused ? 1 : 0.5 }} />
              )
            }}
          />

          <Tabs.Screen
            name="orders"
            options={{
              title: "Pedidos",
              tabBarIcon: ({ focused }: { focused: boolean }) => (
                <Ionicons name="receipt" size={20} color="#555" style={{ opacity: focused ? 1 : 0.5 }} />
              )
            }}
          />

          <Tabs.Screen
            name="catalog"
            options={{
              title: "Catálogo",
              tabBarIcon: ({ focused }: { focused: boolean }) => (
                <Ionicons name="cube" size={20} color="#555" style={{ opacity: focused ? 1 : 0.5 }} />
              )
            }}
          />

          <Tabs.Screen
            name="plans"
            options={{
              title: "Planos",
              tabBarIcon: ({ focused }: { focused: boolean }) => (
                <Ionicons name="pricetag" size={20} color="#555" style={{ opacity: focused ? 1 : 0.5 }} />
              )
            }}
          />
      </Tabs>
    </QueryClientProvider>
  );
}

