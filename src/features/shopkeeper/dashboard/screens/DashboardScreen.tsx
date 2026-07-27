import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { MetricCard } from "@/src/features/shopkeeper/dashboard/components/MetricCard";
import { WeekChart } from "@/src/features/shopkeeper/dashboard/components/WeekChart";
import { useShopkeeperMe } from "@/src/features/shopkeeper/auth/hooks/useShopkeeperMe";
import { useDashboard } from "@/src/features/shopkeeper/dashboard/hooks/useDashboard";
import { OrderApiStatus } from "@/src/features/shopkeeper/dashboard/services/dashboardService";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

function isPending(status: OrderApiStatus) {
  return status === "PENDING";
}

function StatusBadge({ status }: { status: OrderApiStatus }) {
  const confirmed = !isPending(status);
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

  const { data: shopkeeper } = useShopkeeperMe();
  const { data: dashboard, isLoading, isError, error, refetch, isRefetching } = useDashboard();

  if (isLoading) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-[#F8F5F2] items-center justify-center">
        <ActivityIndicator color="#E7A35A" size="large" />
      </SafeAreaView>
    );
  }

  if (isError || !dashboard) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-[#F8F5F2] items-center justify-center px-8">
        <Text className="text-sm text-[#2D2D2D] text-center mb-3">
          Não foi possível carregar os dados do dashboard.
        </Text>
        <TouchableOpacity onPress={() => refetch()} className="bg-[#E7A35A] rounded-xl px-4 py-2.5">
          <Text className="text-white text-sm">Tentar novamente</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-[#F8F5F2]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} tintColor="#E7A35A" />
        }
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
              <Text className="text-sm text-[#2D2D2D]" numberOfLines={1}>Bom dia, {shopkeeper?.name} </Text>
              <Text className="text-xs text-[#8A8A8A]">{shopkeeper?.companyName}</Text>
            </View>
          </View>
        </View>

        <View className="px-5 mt-5 gap-3">
          <View className="flex-row gap-3">
            <MetricCard label="Pedidos hoje" value={String(dashboard.ordersToday)} icon="bag-handle-outline" />
            <MetricCard label="Receita hoje" value={currencyFormatter.format(dashboard.revenueToday)} icon="cash-outline" />
          </View>
          <View className="flex-row gap-3">
            <MetricCard label="Produtos ativos" value={String(dashboard.activeProducts)} icon="grid-outline" />
            <MetricCard label="Pedidos pendentes" value={String(dashboard.pendingOrders)} icon="hourglass-outline" />
          </View>
        </View>

        <WeekChart data={dashboard.weeklySales} />

        <View className="px-5 mt-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-xl font-interBold text-[#2D2D2D]">Pedidos recentes</Text>
            <TouchableOpacity onPress={() => router.push("/shopkeeper/(tabs)/orders" as any)}>
              <Text className="text-sm text-[#E7A35A]">Ver todos</Text>
            </TouchableOpacity>
          </View>

          <View className="gap-2.5">
            {dashboard.recentOrders.length === 0 && (
              <Text className="text-sm text-[#8A8A8A] text-center py-4">Nenhum pedido recente.</Text>
            )}

            {dashboard.recentOrders.map((order) => (
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
                    {order.code} · {order.customerName}
                  </Text>
                  <Text className="text-xs text-[#8A8A8A] mt-0.5" numberOfLines={1}>
                    {order.items.map((item) => item.name).join(", ")}
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