import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { OrderCard } from "@/src/features/shopkeeper/orders/components/OrderCard";
import { SummaryCard } from "@/src/features/shopkeeper/orders/components/SummaryCard";
import { useShopkeeperOrders } from "@/src/features/shopkeeper/orders/hooks/useShopkeeperOrders";
import { mapToDisplayOrder } from "@/src/features/shopkeeper/orders/utils/orderMapper";

// "Todos" não é um status da API — é a ausência de filtro.
type TabType = "Todos" | "Pendente" | "Concluído";

const TABS: TabType[] = ["Todos", "Pendente", "Concluído"];

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("Todos");

  const { data: apiOrders, isLoading, isError, refetch } = useShopkeeperOrders();

  const orders = (apiOrders ?? []).map(mapToDisplayOrder);

  const counts = {
    Todos:     orders.length,
    Pendente:  orders.filter((o) => o.status === "Pendente").length,
    Concluído: orders.filter((o) => o.status === "Concluído").length,
  };

  const filtered = activeTab === "Todos"
    ? orders
    : orders.filter((o) => o.status === activeTab);

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-[#F8F5F2]">
      <View className="px-5 py-4 pb-4 bg-[#F8F5F2] border-b border-[#E8E3DE]" style={{ paddingTop: insets.top }}>
        <View className="flex-row items-center justify-center">
          <Text className="text-xl font-interBold text-[#2D2D2D]">Pedidos</Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row px-5 mt-4 gap-2.5">
          <SummaryCard icon="receipt-outline"     count={counts["Todos"]}     label="Todos os pedidos" />
          <SummaryCard icon="hourglass-outline"   count={counts["Pendente"]}  label="Pendentes"        />
          <SummaryCard icon="checkmark-circle"    count={counts["Concluído"]} label="Concluídos"       />
        </View>

        <View className="flex-row px-5 mt-6 border-b border-[#E8E3DE]">
          {TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} className="mr-5 pb-2">
                <Text className={`font-interBold text-base ${isActive ? "text-[#E7A35A]" : "text-[#8A8A8A]"}`}>
                  {tab}
                </Text>
                {isActive && <View className="h-0.5 bg-[#E7A35A] rounded-full mt-1.5" />}
              </TouchableOpacity>
            );
          })}
        </View>

        <View className="flex-row items-center justify-between px-5 py-2.5 border-b border-[#E8E3DE]">
          <View className="flex-row items-center gap-1.5">
            <Ionicons name="time-outline" size={14} color="#8A8A8A" />
            <Text className="font-inter text-xs text-[#8A8A8A]">Pedidos mais recentes</Text>
          </View>
          <TouchableOpacity onPress={() => refetch()}>
            <Text className="font-inter text-xs text-[#22C55E]">
              {isLoading ? "Atualizando..." : "Atualizado agora"}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="px-5 mt-4">
          {isLoading ? (
            <View className="items-center py-16">
              <ActivityIndicator color="#E7A35A" />
            </View>
          ) : isError ? (
            <View className="items-center py-16">
              <Ionicons name="alert-circle-outline" size={48} color="#E8E3DE" />
              <Text className="font-inter text-[#8A8A8A] mt-3 text-center">
                Não foi possível carregar os pedidos
              </Text>
              <TouchableOpacity onPress={() => refetch()} className="mt-3">
                <Text className="font-inter text-[#E7A35A] text-sm">Tentar novamente</Text>
              </TouchableOpacity>
            </View>
          ) : filtered.length === 0 ? (
            <View className="items-center py-16">
              <Ionicons name="clipboard-outline" size={48} color="#E8E3DE" />
              <Text className="font-inter text-[#8A8A8A] mt-3">Nenhum pedido nesta categoria</Text>
            </View>
          ) : (
            filtered.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onPress={() =>
                  router.push({
                    pathname: "/shopkeeper/(private)/orders/order-detail",
                    params: { id: order.id },
                  })
                }
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}