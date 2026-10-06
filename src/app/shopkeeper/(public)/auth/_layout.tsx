import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { IrishGrover_400Regular } from "@expo-google-fonts/irish-grover";
import { Itim_400Regular } from "@expo-google-fonts/itim";
import { KeyboardProvider } from "react-native-keyboard-controller";
import * as NavigationBar from "expo-navigation-bar";
import { StatusBar } from "expo-status-bar";
import "@/global.css";
import { useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/src/services/queryClient";

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
    <QueryClientProvider client={queryClient}>
      <KeyboardProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }} />
      </KeyboardProvider>
    </QueryClientProvider>
  )
}
