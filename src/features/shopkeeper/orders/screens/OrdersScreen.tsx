import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { OrderCard, Order, StatusType } from "../components/OrderCard";
import { SummaryCard } from "../components/SummaryCard";

// TODO: substituir por chamada à API (GET /shopkeeper/orders) quando o backend estiver pronto
const ORDERS: Order[] = [
  { initials: "MR", name: "Maria Ribeiro", time: "Há 5 min",  items: "1x Tapioca Clássica, 1x Suco de Caju",  code: "A3F92", status: "Pendente"   },
  { initials: "JS", name: "João Silva",    time: "Há 8 min",  items: "2x Açaí Bowl, 1x Água de Coco",         code: "B7K45", status: "Em Preparo" },
  { initials: "AC", name: "Ana Costa",     time: "Há 12 min", items: "1x Bolo de Rolo, 1x Café Expresso",     code: "C9N73", status: "Pendente"   },
  { initials: "PL", name: "Pedro Luz",     time: "Há 20 min", items: "1x Pastel de Camarão, 2x Água de Coco", code: "D2M11", status: "Concluído"  },
];

const TABS: StatusType[] = ["Pendente", "Em Preparo", "Concluído"];

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<StatusType>("Pendente");

  const counts = {
    Pendente:     ORDERS.filter((o) => o.status === "Pendente").length,
    "Em Preparo": ORDERS.filter((o) => o.status === "Em Preparo").length,
    Concluído:    ORDERS.filter((o) => o.status === "Concluído").length,
  };

  const filtered = ORDERS.filter((o) => o.status === activeTab);

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
          <SummaryCard icon="hourglass-outline" count={counts["Pendente"]}    label="Pendentes"       />
          <SummaryCard icon="flame"             count={counts["Em Preparo"]}  label="Em Preparo"      />
          <SummaryCard icon="checkmark-circle"  count={counts["Concluído"]}   label="Concluídos hoje" />
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

        <View className="flex-row items-center justify-between px-5 py-2.5  border-b border-[#E8E3DE]">
          <View className="flex-row items-center gap-1.5">
            <Ionicons name="time-outline" size={14} color="#8A8A8A" />
            <Text className="font-inter text-xs text-[#8A8A8A]">Pedidos mais recentes</Text>
          </View>
          <Text className="font-inter text-xs text-[#22C55E]">Atualizado agora</Text>
        </View>

        <View className="px-5 mt-4">
          {filtered.length === 0 ? (
            <View className="items-center py-16">
              <Ionicons name="clipboard-outline" size={48} color="#E8E3DE" />
              <Text className="font-inter text-[#8A8A8A] mt-3">Nenhum pedido nesta categoria</Text>
            </View>
          ) : (
            filtered.map((order) => (
              <OrderCard
                key={order.code}
                order={order}
                onPress={() =>
                  router.push({
                    pathname: "/shopkeeper/(private)/orders/order-detail",
                    params: { code: order.code },
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