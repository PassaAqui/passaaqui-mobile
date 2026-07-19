import HomeScreen from "@/src/features/home/screens/HomeScreen";
import { Redirect } from "expo-router";

export default function Index() {
  // Apenas em desenvolvimento para testar novas telas
  return <Redirect href={"/shopkeeper/(private)/orders/prepare-order"} />

  return <HomeScreen />
}
