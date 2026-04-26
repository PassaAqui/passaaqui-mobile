import { Tabs } from "expo-router";
import { useFonts } from "expo-font";
import { useRouter } from "expo-router";
import { IrishGrover_400Regular } from "@expo-google-fonts/irish-grover";
import { Itim_400Regular } from "@expo-google-fonts/itim";
import { Image } from "react-native";
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
        <Tabs.Screen
          name="index"
          options={{
            title: "Explorar",
            tabBarIcon: ({ focused }: { focused: boolean }) => (
              <Image
                source={require("@/assets/user/map/map-icon.png")}
                className="w-8 h-8"
                style={{ resizeMode: "contain", opacity: focused ? 1 : 0.5 }}
              />
            )
          }}
        />

        <Tabs.Screen
          name="shop"
          options={{
            title: "Loja",
            tabBarIcon: ({ focused }: { focused: boolean }) => (
              <Image
                source={require("@/assets/user/map/poi/shop/shop-icon.png")}
                className="w-8 h-8"
                style={{ resizeMode: "contain", opacity: focused ? 1 : 0.5 }}
              />
            )
          }}
        />

        <Tabs.Screen
          name="achievements"
          options={{
            title: "Conquistas",
            tabBarIcon: ({ focused }: { focused: boolean }) => (
              <Image
                source={require("@/assets/user/map/achievements.png")}
                className="w-8 h-8"
                style={{ resizeMode: "contain", opacity: focused ? 1 : 0.5 }}
              />
            )
          }}
        />

        <Tabs.Screen
          name="redirect"
          options={{
            title: "Configurações",
            tabBarIcon: ({ focused }: { focused: boolean }) => (
              <Image
                source={require("@/assets/user/map/menu.png")}
                className="w-8 h-8"
                style={{ resizeMode: "contain", opacity: focused ? 1 : 0.5 }}
              />
            )
          }}
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
