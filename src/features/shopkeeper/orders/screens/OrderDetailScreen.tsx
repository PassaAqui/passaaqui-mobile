import { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import * as NavigationBar from "expo-navigation-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";

type StatusType = "Pendente" | "Em Preparo" | "Concluído";

interface OrderItem {
  name: string;
  qty: number;
  price: string;
}

interface OrderDetail {
  code: string;
  initials: string;
  name: string;
  time: string;
  status: StatusType;
  items: OrderItem[];
  total: string;
}

// Mock lookup — in a real app this would come from the orders store/API by code
const ORDER_DETAILS: Record<string, OrderDetail> = {
  A3F92: {
    code: "A3F92",
    initials: "MR",
    name: "Maria Ribeiro",
    time: "Há 5 min",
    status: "Pendente",
    items: [
      { name: "Tapioca Clássica", qty: 1, price: "R$ 12,00" },
      { name: "Suco de Caju", qty: 1, price: "R$ 6,00" },
    ],
    total: "R$ 18,00",
  },
  B7K45: {
    code: "B7K45",
    initials: "JS",
    name: "João Silva",
    time: "Há 8 min",
    status: "Em Preparo",
    items: [
      { name: "Açaí Bowl", qty: 2, price: "R$ 8,50" },
      { name: "Água de Coco", qty: 1, price: "R$ 5,00" },
    ],
    total: "R$ 22,00",
  },
  C9N73: {
    code: "C9N73",
    initials: "AC",
    name: "Ana Costa",
    time: "Há 12 min",
    status: "Pendente",
    items: [
      { name: "Bolo de Rolo", qty: 1, price: "R$ 9,00" },
      { name: "Café Expresso", qty: 1, price: "R$ 4,50" },
    ],
    total: "R$ 13,50",
  },
  D2M11: {
    code: "D2M11",
    initials: "PL",
    name: "Pedro Luz",
    time: "Há 20 min",
    status: "Concluído",
    items: [
      { name: "Pastel de Camarão", qty: 1, price: "R$ 15,50" },
      { name: "Água de Coco", qty: 2, price: "R$ 5,00" },
    ],
    total: "R$ 25,50",
  },
};

const STATUS_CONFIG: Record<StatusType, {
  icon: keyof typeof Ionicons.glyphMap;
  bgColor: string;
  textColor: string;
}> = {
  Pendente:     { icon: "hourglass-outline", bgColor: "#F3F3F3", textColor: "#8A8A8A" },
  "Em Preparo": { icon: "flame",             bgColor: "#FBE6CF", textColor: "#E7A35A" },
  Concluído:    { icon: "checkmark-circle",  bgColor: "#DCFCE7", textColor: "#22C55E" },
};

const NEXT_STATUS: Record<StatusType, StatusType | null> = {
  Pendente: "Em Preparo",
  "Em Preparo": "Concluído",
  Concluído: null,
};

const NEXT_LABEL: Record<StatusType, string> = {
  Pendente: "Iniciar preparo",
  "Em Preparo": "Marcar como concluído",
  Concluído: "",
};

export default function OrderDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { code } = useLocalSearchParams<{ code: string }>();

  const order = ORDER_DETAILS[code ?? ""];
  const [status, setStatus] = useState<StatusType>(order?.status ?? "Pendente");

  useEffect(() => {
    NavigationBar.setButtonStyleAsync("dark");
  }, []);

  if (!order) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-[#F8F5F2] items-center justify-center px-8">
        <Ionicons name="alert-circle-outline" size={44} color="#8A8A8A" />
        <Text className="font-inter text-[#8A8A8A] mt-3 text-center">
          Pedido não encontrado
        </Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-5">
          <Text className="font-inter text-[#E7A35A] text-base">Voltar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const cfg = STATUS_CONFIG[status];
  const next = NEXT_STATUS[status];

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-[#F8F5F2]">
      <View className="flex-row items-center justify-between px-5 pt-5 pb-4 bg-[#F8F5F2] border-b border-[#E8E3DE]" style={{ paddingTop: insets.top }}>
        <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Voltar">
          <Ionicons name="chevron-back" size={24} color="#2D2D2D" />
        </TouchableOpacity>
        <Text className="text-xl font-interBold text-[#2D2D2D]">Pedido #{order.code}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        <View className="px-5 pt-5 gap-4">
          {/* Customer card */}
          <View className="bg-white border border-[#E8E3DE] rounded-2xl p-4 flex-row items-center">
            <View className="w-12 h-12 rounded-full bg-[#E7A35A] items-center justify-center">
              <Text className="text-white font-inter text-base">{order.initials}</Text>
            </View>
            <View className="ml-3 flex-1">
              <Text className="font-inter text-base text-[#2D2D2D]">{order.name}</Text>
              <View className="flex-row items-center mt-0.5">
                <Ionicons name="time-outline" size={12} color="#8A8A8A" />
                <Text className="font-inter text-xs text-[#8A8A8A] ml-1">{order.time}</Text>
              </View>
            </View>
            <View className="px-3 py-1.5 rounded-xl flex-row items-center" style={{ backgroundColor: cfg.bgColor }}>
              <Ionicons name={cfg.icon} size={13} color={cfg.textColor} />
              <Text className="ml-1 text-xs font-inter" style={{ color: cfg.textColor }}>{status}</Text>
            </View>
          </View>

          {/* Pickup code */}
          <View className="bg-[#E7A35A] rounded-2xl p-5 items-center">
            <Text className="font-inter text-white text-xs">Código de retirada</Text>
            <Text className="font-interBold text-white text-3xl mt-1 tracking-widest">
              #{order.code}
            </Text>
          </View>

          {/* Items */}
          <View className="bg-white border border-[#E8E3DE] rounded-2xl p-4">
            <Text className="font-interBold text-base text-[#2D2D2D] mb-3">Itens do pedido</Text>
            {order.items.map((item, i) => (
              <View key={i}>
                <View className="flex-row items-center justify-between py-2">
                  <Text className="font-inter text-sm text-[#2D2D2D] flex-1" numberOfLines={1}>
                    {item.qty}x {item.name}
                  </Text>
                  <Text className="font-inter text-sm text-[#2D2D2D]">{item.price}</Text>
                </View>
                {i < order.items.length - 1 && <View className="h-px bg-[#E8E3DE]" />}
              </View>
            ))}
            <View className="h-px bg-[#E8E3DE] my-3" />
            <View className="flex-row items-center justify-between">
              <Text className="font-inter text-base text-[#2D2D2D]">Total</Text>
              <Text className="font-interBold text-lg text-[#E7A35A]">{order.total}</Text>
            </View>
          </View>

          {/* Status action */}
          {next && (
            <TouchableOpacity
              className="bg-[#E7A35A] rounded-xl py-3.5 items-center flex-row justify-center gap-2"
              onPress={() => setStatus(next)}
              accessibilityRole="button"
              accessibilityLabel={NEXT_LABEL[status]}
            >
              <Ionicons name="arrow-forward-circle-outline" size={18} color="white" />
              <Text className="font-inter text-white text-base">{NEXT_LABEL[status]}</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}