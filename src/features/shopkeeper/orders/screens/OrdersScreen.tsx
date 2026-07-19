import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import * as NavigationBar from "expo-navigation-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

type StatusType = "Pendente" | "Em Preparo" | "Concluído";

interface Order {
  initials: string;
  name: string;
  time: string;
  items: string;
  code: string;
  status: StatusType;
}

// TODO: substituir por chamada à API (GET /shopkeeper/orders) quando o backend estiver pronto
const ORDERS: Order[] = [
  { initials: "MR", name: "Maria Ribeiro", time: "Há 5 min",  items: "1x Tapioca Clássica, 1x Suco de Caju",  code: "A3F92", status: "Pendente"   },
  { initials: "JS", name: "João Silva",    time: "Há 8 min",  items: "2x Açaí Bowl, 1x Água de Coco",         code: "B7K45", status: "Em Preparo" },
  { initials: "AC", name: "Ana Costa",     time: "Há 12 min", items: "1x Bolo de Rolo, 1x Café Expresso",     code: "C9N73", status: "Pendente"   },
  { initials: "PL", name: "Pedro Luz",     time: "Há 20 min", items: "1x Pastel de Camarão, 2x Água de Coco", code: "D2M11", status: "Concluído"  },
];

const TABS: StatusType[] = ["Pendente", "Em Preparo", "Concluído"];
const COLORS = { primary: "#E7A35A", muted: "#8A8A8A", border: "#E8E3DE" };

const STATUS_CONFIG: Record<StatusType, {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  bgColor: string;
  textColor: string;
  label: string;
}> = {
  Pendente:     { icon: "hourglass-outline", iconColor: COLORS.muted,   bgColor: "#F3F3F3", textColor: "#8A8A8A", label: "Pendente"   },
  "Em Preparo": { icon: "flame",             iconColor: COLORS.primary, bgColor: "#FBE6CF", textColor: "#E7A35A", label: "Em Preparo" },
  Concluído:    { icon: "checkmark-circle",  iconColor: "#22C55E",      bgColor: "#DCFCE7", textColor: "#22C55E", label: "Concluído"  },
};

function SummaryCard({ icon, count, label }: {
  icon: keyof typeof Ionicons.glyphMap; count: number; label: string;
}) {
  return (
    <View className="flex-1 bg-[#E7A35A] rounded-2xl py-4 items-center justify-center">
      <Ionicons name={icon} size={20} color="white" />
      <Text className="text-white text-3xl font-interBold mt-1" adjustsFontSizeToFit numberOfLines={1}>{count}</Text>
      <Text className="text-white text-xs font-inter text-center px-1 mt-0.5">{label}</Text>
    </View>
  );
}

function StatusBadge({ status }: { status: StatusType }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <View className="px-3 py-1.5 rounded-xl flex-row items-center" style={{ backgroundColor: cfg.bgColor }}>
      <Ionicons name={cfg.icon} size={13} color={cfg.iconColor} />
      <Text className="ml-1 text-xs font-inter" style={{ color: cfg.textColor }}>{cfg.label}</Text>
    </View>
  );
}

function OrderCard({ order, onPress }: { order: Order; onPress: () => void }) {
  return (
    <TouchableOpacity
      className="bg-white rounded-2xl border border-[#E8E3DE] px-4 py-4 mb-3"
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center flex-1 mr-2">
          <View className="w-10 h-10 rounded-full bg-[#E7A35A] items-center justify-center">
            <Text className="text-white font-interBold text-sm">{order.initials}</Text>
          </View>
          <Text className="ml-2.5 text-base font-interBold text-[#2D2D2D] flex-1" numberOfLines={1}>{order.name}</Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="time-outline" size={13} color={COLORS.muted} />
          <Text className="ml-1 text-xs text-[#8A8A8A] font-inter">{order.time}</Text>
        </View>
      </View>

      <View className="h-px bg-[#E8E3DE] my-3" />

      <View className="flex-row items-start">
        <Ionicons name="bag-handle-outline" size={14} color={COLORS.muted} />
        <Text className="ml-2 text-sm text-[#8A8A8A] font-inter flex-1" numberOfLines={2}>{order.items}</Text>
      </View>

      <View className="h-px bg-[#E8E3DE] my-3" />

      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center">
          <Ionicons name="key-outline" size={13} color={COLORS.muted} />
          <Text className="ml-1.5 text-xs text-[#8A8A8A] font-inter">Código</Text>
          <View className="bg-[#E7A35A] px-2.5 py-1 rounded-lg ml-2">
            <Text className="text-white text-xs font-interBold">#{order.code}</Text>
          </View>
        </View>
        <View className="flex-row items-center gap-1.5">
          <StatusBadge status={order.status} />
          <Ionicons name="chevron-forward" size={16} color={COLORS.muted} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<StatusType>("Pendente");

  useEffect(() => {
    NavigationBar.setButtonStyleAsync("dark");
  }, []);

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
              <Ionicons name="clipboard-outline" size={48} color={COLORS.border} />
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