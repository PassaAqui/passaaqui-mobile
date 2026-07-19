import { useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import * as NavigationBar from "expo-navigation-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

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

const CHART_DATA = [45, 38, 52, 40, 66, 92, 72];
const WEEK_DAYS  = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const CHART_MAX  = Math.max(...CHART_DATA);
const CHART_HEIGHT = 120;
const Y_AXIS_WIDTH  = 28;
const Y_STEPS = [80, 60, 40, 20, 0];

const C = {
  primary: "#E7A35A",
  primaryLight: "#FBE6CF",
  text: "#2D2D2D",
  muted: "#8A8A8A",
  border: "#E8E3DE",
};

function MetricCard({ label, value, icon, badge }: {label: string; value: string; icon: keyof typeof Ionicons.glyphMap; badge?: string }) {
  return (
    <View className="bg-[#E7A35A] rounded-2xl p-4 flex-1">
      <View className="flex-row justify-between items-center">
        <Text className="text-white  text-sm flex-1 mr-1" numberOfLines={1}>{label}</Text>
        <Ionicons name={icon} size={16} color="rgba(255,255,255,0.8)" />
      </View>
      <View className="flex-row items-end mt-3 gap-2">
        <Text className="text-white  text-3xl" adjustsFontSizeToFit numberOfLines={1}>{value}</Text>
        {badge && (
          <View className="bg-white/20 rounded-full px-2 py-0.5 mb-1 flex-row items-center">
            <Ionicons name="arrow-up" size={9} color="white" />
            <Text className="text-white text-xs  ml-0.5">{badge}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const confirmed = status === "confirmado";
  return (
    <View
      className="px-2.5 py-1 rounded-xl"
      style={{ backgroundColor: confirmed ? "#DCFCE7" : "#FBE6CF" }}
    >
      <Text className=" text-xs" style={{ color: confirmed ? "#22C55E" : "#E7A35A" }}>
        {confirmed ? "Confirmado" : "Pendente"}
      </Text>
    </View>
  );
}

function WeekChart() {
  return (
    <View className="mx-5 mt-5 bg-[#E7A35A] rounded-2xl p-4">
      <Text className="text-white font-interBold text-xl mb-4">Vendas da semana</Text>
      <View className="bg-white/15 rounded-xl p-3">
        <View style={{ flexDirection: "row", height: CHART_HEIGHT }}>
          <View style={{ width: Y_AXIS_WIDTH, position: "relative" }}>
            {Y_STEPS.map((step, i) => (
              <Text
                key={step}
                style={{
                  position: "absolute",
                  top: (i / (Y_STEPS.length - 1)) * CHART_HEIGHT - 6,
                  right: 4,
                  fontSize: 9,
                  color: "rgba(255,255,255,0.6)",
                  fontFamily: "_400Regular",
                }}
              >
                {step}
              </Text>
            ))}
          </View>
          <View style={{ flex: 1, position: "relative" }}>
            {Y_STEPS.map((step, i) => (
              <View
                key={step}
                style={{
                  position: "absolute",
                  top: (i / (Y_STEPS.length - 1)) * CHART_HEIGHT,
                  left: 0, right: 0, height: 1,
                  backgroundColor: "rgba(255,255,255,0.2)",
                }}
              />
            ))}
            <View
              style={{
                flexDirection: "row", alignItems: "flex-end", justifyContent: "space-around",
                position: "absolute", bottom: 0, left: 0, right: 0, height: CHART_HEIGHT,
              }}
            >
              {CHART_DATA.map((value, index) => {
                const isMax = value === CHART_MAX;
                const barH = Math.round((value / CHART_MAX) * (CHART_HEIGHT - 14));
                return (
                  <View key={index} style={{ alignItems: "center", flex: 1 }}>
                    {isMax && (
                      <Text style={{ color: "white", fontSize: 10, fontFamily: "_400Regular", marginBottom: 2 }}>
                        {value}
                      </Text>
                    )}
                    <View
                      style={{
                        width: 18, height: barH, borderTopLeftRadius: 4, borderTopRightRadius: 4,
                        backgroundColor: isMax ? "white" : "rgba(255,255,255,0.4)",
                      }}
                    />
                  </View>
                );
              })}
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-around", marginTop: 6, paddingLeft: Y_AXIS_WIDTH }}>
          {WEEK_DAYS.map((day) => (
            <Text key={day} style={{ flex: 1, textAlign: "center", color: "white", fontSize: 10, fontFamily: "_400Regular" }}>
              {day}
            </Text>
          ))}
        </View>
      </View>
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
              <Text className="text-sm  text-[#E7A35A]">Ver todos</Text>
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
                  <Ionicons name="person" size={18} color={C.primary} />
                </View>
                <View className="flex-1 mx-3">
                  <Text className=" text-sm text-[#2D2D2D]" numberOfLines={1}>
                    {order.code} · {order.customer}
                  </Text>
                  <Text className=" text-xs text-[#8A8A8A] mt-0.5" numberOfLines={1}>
                    {order.product}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1.5">
                  <StatusBadge status={order.status} />
                  <Ionicons name="chevron-forward" size={15} color={C.muted} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}