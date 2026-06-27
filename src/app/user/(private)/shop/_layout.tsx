import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { IrishGrover_400Regular } from "@expo-google-fonts/irish-grover"
import { Itim_400Regular } from "@expo-google-fonts/itim"
import { Inter_400Regular, Inter_700Bold } from "@expo-google-fonts/inter"
import * as NavigationBar from "expo-navigation-bar";
import { StatusBar } from "expo-status-bar";
import "@/global.css";
import { useEffect } from "react";

export default function RootLayout() {
  let [fontsLoaded] = useFonts({
    IrishGrover_400Regular,
    Itim_400Regular,
    Inter_400Regular,
    Inter_700Bold
  });

  useEffect(() => {
    NavigationBar.setButtonStyleAsync("dark");
  })

  if (!fontsLoaded) return null;

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  )
}
