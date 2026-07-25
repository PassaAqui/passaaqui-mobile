import { Stack, useRouter } from "expo-router";
import { useFonts } from "expo-font";
import { useState, useEffect } from "react";
import { tryRestoreSession } from "@/src/features/roles/user/auth/services/authService";
import { IrishGrover_400Regular } from "@expo-google-fonts/irish-grover";
import { Itim_400Regular } from "@expo-google-fonts/itim";
import "@/global.css";
import { tryRestoreShopkeeperSession } from "@/src/features/roles/shopkeeper/auth/services/shopkeeperAuthService";

let sessionChecked = false;

export default function RootLayout() {
  const router = useRouter();
  const [checking, setChecking] = useState<boolean>(true);
  const [restored, setRestored] = useState<{ tourist: boolean; shopkeeper: boolean }>({
    tourist: false,
    shopkeeper: false,
  });
  
  let [fontsLoaded] = useFonts({
    IrishGrover_400Regular,
    Itim_400Regular
  });

  useEffect(() => {
    if (sessionChecked) return;
    sessionChecked = true;

    Promise.all([
      tryRestoreSession(),
      tryRestoreShopkeeperSession(),
    ]).then(([touristRestored, shopkeeperRestored]) => {
      setRestored({ tourist: touristRestored, shopkeeper: shopkeeperRestored });
      setChecking(false);
    });
  }, []);

  useEffect(() => {
    if (checking || !fontsLoaded) return;

    if (restored.tourist) {
      router.replace("/user/(private)/map/(tabs)");
    } else if (restored.shopkeeper) {
      router.replace("/shopkeeper/(private)/(tabs)");
    }
  }, [checking, fontsLoaded, restored]);

  if (!fontsLoaded || checking) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}
