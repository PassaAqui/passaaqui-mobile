import { Stack, useRouter } from "expo-router";
import { useFonts } from "expo-font";
import { useState, useEffect, useRef } from "react";
import { tryRestoreSession } from "@/src/features/user/auth/services/authService";
import { IrishGrover_400Regular } from "@expo-google-fonts/irish-grover";
import { Itim_400Regular } from "@expo-google-fonts/itim";
import "@/global.css";

export default function RootLayout() {
  const [checking, setChecking] = useState<boolean>(true);
  const router = useRouter();
  const hasCheckedSession = useRef(false);
  
  let [fontsLoaded] = useFonts({
    IrishGrover_400Regular,
    Itim_400Regular
  });

  useEffect(() => {
    if (hasCheckedSession.current) return;
    hasCheckedSession.current = true;

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
