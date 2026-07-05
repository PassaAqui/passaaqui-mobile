import { Stack, useRouter } from "expo-router";
import { useFonts } from "expo-font";
import { useState, useEffect } from "react";
import { tryRestoreSession } from "@/src/features/user/auth/services/authService";
import { IrishGrover_400Regular } from "@expo-google-fonts/irish-grover";
import { Itim_400Regular } from "@expo-google-fonts/itim";
import "@/global.css";

export default function RootLayout() {
  const [checking, setChecking] = useState<boolean>(true);
  const router = useRouter();
  let [fontsLoaded] = useFonts({
    IrishGrover_400Regular,
    Itim_400Regular
  });

  useEffect(() => {
    tryRestoreSession().then((restored) => {
      setChecking(false);
      if (restored) {
        router.replace("/user/(private)/map/(tabs)")
      }
    });
  }, []);

  if (!fontsLoaded || checking) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}
