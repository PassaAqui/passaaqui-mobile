import { useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import * as NavigationBar from "expo-navigation-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { MetricCard } from "@/src/features/shopkeeper/dashboard/components/MetricCard";
import { WeekChart } from "@/src/features/shopkeeper/dashboard/components/WeekChart";

type OrderStatus = "confirmado" | "pendente";

interface RecentOrder {
  id: number;
  code: string;
  customer: string;
  product: string;
  status: OrderStatus;
}

const RECENT_ORDERS: RecentOrder[] = [
  { id: 1, code: "#0042", customer: "Maria Silva", product: "Vaso decorativo pequeno", status: "confirmado" },
  { id: 2, code: "#0041", customer: "João Costa",  product: "Tapioca Clássica",        status: "pendente"   },
  { id: 3, code: "#0040", customer: "Ana Souza",   product: "Açaí Bowl",               status: "pendente"   },
  { id: 4, code: "#0039", customer: "Pedro Lima",  product: "Água de Coco",            status: "pendente"   },
];

function StatusBadge({ status }: { status: OrderStatus }) {
  const confirmed = status === "confirmado";
  return (
    <View
      className="px-2.5 py-1 rounded-xl"
      style={{ backgroundColor: confirmed ? "#DCFCE7" : "#FBE6CF" }}
    >
      <Text className="text-xs" style={{ color: confirmed ? "#22C55E" : "#E7A35A" }}>
        {confirmed ? "Confirmado" : "Pendente"}
      </Text>
    </View>
  );
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  useEffect(() => {
    NavigationBar.setButtonStyleAsync("dark");
  }, []);

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-[#F8F5F2]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        <View className="bg-[#F8F5F2] border-b border-[#E8E3DE] px-5 pt-5 pb-4">
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center gap-2.5">
              <View className="w-11 h-11 border border-[#E8E3DE] rounded-xl items-center justify-center bg-[#FBE6CF]">
                <Image className="w-10 h-10" source={require("@/assets/logo/logoOFC.png")} />
              </View>
              <Text className="text-xl font-interBold text-[#2D2D2D]">PassaAqui</Text>
            </View>
            <View className="items-end">
              <Text className="text-sm text-[#2D2D2D]" numberOfLines={1}>Bom dia, David </Text>
              <Text className="text-xs text-[#8A8A8A]">Loja do seu Zé</Text>
            </View>
          </View>
        </View>

        <View className="px-5 mt-5 gap-3">
          <View className="flex-row gap-3">
            <MetricCard label="Pedidos hoje" value="23" icon="bag-handle-outline" badge="+12%" />
            <MetricCard label="Receita hoje" value="R$347" icon="cash-outline" badge="+8%" />
          </View>
          <View className="flex-row gap-3">
            <MetricCard label="Produtos ativos" value="142" icon="grid-outline" />
            <MetricCard label="Pedidos pendentes" value="5" icon="hourglass-outline" />
          </View>
        </View>

        <WeekChart />

        <View className="px-5 mt-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-xl font-interBold text-[#2D2D2D]">Pedidos recentes</Text>
            <TouchableOpacity onPress={() => router.push("/shopkeeper/(tabs)/orders" as any)}>
              <Text className="text-sm text-[#E7A35A]">Ver todos</Text>
            </TouchableOpacity>
          </View>

          <View className="gap-2.5">
            {RECENT_ORDERS.map((order) => (
              <TouchableOpacity
                key={order.id}
                className="bg-white border border-[#E8E3DE] rounded-2xl p-3.5 flex-row items-center"
                activeOpacity={0.7}
                onPress={() =>
                  router.push({
                    pathname: "/shopkeeper/(private)/orders/order-detail",
                    params: { code: order.code.replace("#", "") },
                  })
                }
              >
                <View className="w-10 h-10 bg-[#FBE6CF] rounded-full items-center justify-center">
                  <Ionicons name="person" size={18} color="#E7A35A" />
                </View>
                <View className="flex-1 mx-3">
                  <Text className="text-sm text-[#2D2D2D]" numberOfLines={1}>
                    {order.code} · {order.customer}
                  </Text>
                  <Text className="text-xs text-[#8A8A8A] mt-0.5" numberOfLines={1}>
                    {order.product}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1.5">
                  <StatusBadge status={order.status} />
                  <Ionicons name="chevron-forward" size={15} color="#8A8A8A" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}