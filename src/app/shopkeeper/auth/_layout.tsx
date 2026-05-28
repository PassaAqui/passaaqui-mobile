import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { IrishGrover_400Regular } from "@expo-google-fonts/irish-grover";
import { Itim_400Regular } from "@expo-google-fonts/itim";
import * as NavigationBar from "expo-navigation-bar";
import { StatusBar } from "expo-status-bar";
import "@/global.css";
import { useEffect } from "react";

export default function RootLayout() {
  let [fontsLoaded] = useFonts({
    IrishGrover_400Regular,
    Itim_400Regular
  });

  useEffect(() => {
    NavigationBar.setButtonStyleAsync("light");
  }, [])

  if (!fontsLoaded) return null;

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  )
}
