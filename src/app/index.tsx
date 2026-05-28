import HomeScreen from "@/src/features/home/HomeScreen";
import { Redirect } from "expo-router";

export default function Index() {
  // Apenas em desenvolvimento para testar novas telas
  return <Redirect href={"/user/map/(tabs)"} />

  return <HomeScreen />
}
