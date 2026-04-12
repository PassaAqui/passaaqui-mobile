import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { IrishGrover_400Regular } from "@expo-google-fonts/irish-grover"
import { Itim_400Regular } from "@expo-google-fonts/itim"
import "@/global.css";

export default function RootLayout() {
  let [fontsLoaded] = useFonts({
    IrishGrover_400Regular,
    Itim_400Regular
  });

  if (!fontsLoaded) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}
