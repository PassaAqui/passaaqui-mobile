import { Stack, useRouter } from "expo-router";
import { useFonts } from "expo-font";
import { useState, useEffect, useRef } from "react";
import { tryRestoreSession } from "@/src/features/user/auth/services/authService";
import { IrishGrover_400Regular } from "@expo-google-fonts/irish-grover";
import { Itim_400Regular } from "@expo-google-fonts/itim";
import "@/global.css";

let sessionChecked = false;

export default function RootLayout() {
  const [checking, setChecking] = useState<boolean>(true);
  const [restored, setRestored] = useState<boolean>(true);
  const router = useRouter();
  
  let [fontsLoaded] = useFonts({
    IrishGrover_400Regular,
    Itim_400Regular
  });

  useEffect(() => {
    if (sessionChecked) return;
    sessionChecked = true;

    tryRestoreSession().then((result) => {
      console.log("[RootLayout] renderizou");

      setChecking(false);
      setRestored(result)
    });
  }, []);

  useEffect(() => {
    if (checking || !fontsLoaded) return;

    if (restored) {
      router.replace("/user/(private)/map/(tabs)");
    }
  }, [checking, fontsLoaded, restored]);

  if (!fontsLoaded || checking) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}
