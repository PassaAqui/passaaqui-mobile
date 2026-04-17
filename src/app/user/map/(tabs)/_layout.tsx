import { Tabs } from "expo-router";
import { useFonts } from "expo-font";
import { useRouter } from "expo-router";
import { IrishGrover_400Regular } from "@expo-google-fonts/irish-grover"
import { Itim_400Regular } from "@expo-google-fonts/itim"
import "@/global.css";

export default function TabLayout() {
  const router = useRouter();

  let [fontsLoaded] = useFonts({
    IrishGrover_400Regular,
    Itim_400Regular
  });

  if (!fontsLoaded) return null;

  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: "black", headerShown: false }}>
        <Tabs.Screen name="index" options={{ title: "Explorar" }} />
        <Tabs.Screen
          name="redirect"
          options={{ title: "Configurações" }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              router.push("/user/settings");
            }
          }}
        />
    </Tabs>
  );
}
