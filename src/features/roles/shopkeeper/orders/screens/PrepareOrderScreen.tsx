import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useRouter } from "expo-router";

type OrderStatus = "received" | "preparing" | "ready";

interface OrderItem {
  qty: number;
  name: string;
  note?: string;
  price: string;
}

const STATUS_STEPS = [
  { key: "received" as const, icon: "checkmark", label: "Recebido" },
  { key: "preparing" as const, icon: "restaurant", label: "Em Preparo" },
  { key: "ready" as const, icon: "storefront", label: "Pronto para Retirada" },
];

const ORDER_ITEMS: OrderItem[] = [
  { qty: 1, name: "Tapioca Clássica", note: "Sem açúcar", price: "R$ 12,00" },
  { qty: 1, name: "Café com Leite", price: "R$ 8,00" },
  { qty: 1, name: "Bolo de Milho", price: "R$ 4,00" },
];

export default function PrepareOrderScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [status] = useState<OrderStatus>("preparing");
  const statusIndex = STATUS_STEPS.findIndex((s) => s.key === status);

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-white">
      <View className="flex-row items-center justify-center p-6">
        <Pressable className="absolute left-5" onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </Pressable>
        <Text className="text-lg font-interBold">Preparar Pedido</Text>
      </View>

      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: insets.bottom + 16 }} showsVerticalScrollIndicator={false}>
        <View className="bg-[#EAAA6A] rounded-2xl p-5 mb-5">
          <View className="flex-row justify-between mb-2">
            <View className="flex-row items-center gap-2">
              <Ionicons name="document-text" size={20} color="#fff" />
              <Text className="text-2xl font-interBold text-white">#0042</Text>
            </View>
            <View className="bg-white rounded-full items-center justify-center px-3 py-1">
              <Text className="text-sm text-center text-[#EAAA6A] font-inter">Pendente</Text>
            </View>
          </View>
          <View className="flex-row items-center gap-2 mt-1">
            <Ionicons name="person" size={16} color="#fff" />
            <Text className="text-white font-inter">Maria Silva</Text>
          </View>
          <View className="flex-row items-center gap-2 mt-1">
            <Ionicons name="time" size={16} color="#fff" />
            <Text className="text-white font-inter">Solicitado há 3 minutos</Text>
          </View>
        </View>

        <View className="flex-row items-center gap-2 mb-4 opacity-60">
          <Ionicons name="bag" size={16} color="#000" />
          <Text className="text-lg font-interBold">Itens do Pedido</Text>
        </View>

        {ORDER_ITEMS.map((item, i) => (
          <View
            key={i}
            className="flex-row items-center border border-gray-200 rounded-xl p-4 mb-2"
          >
            <View className="bg-gray-100 rounded-lg px-3 py-2 mr-4">
              <Text className="text-sm font-inter">x{item.qty}</Text>
            </View>
            <View className="flex-1">
              <Text className="font-interBold">{item.name}</Text>
              {item.note && (
                <Text className="text-xs text-gray-500 font-inter">{item.note}</Text>
              )}
            </View>
            <Text className="text-[#EAAA6A] font-interBold">{item.price}</Text>
          </View>
        ))}

        <View className="flex-row items-center justify-end gap-1 mt-2 mb-5">
          <Ionicons name="receipt-outline" size={14} color="#888" />
          <Text className="text-sm text-gray-500 font-inter">
            Total: R$ 24,00
          </Text>
        </View>

        <View className="bg-[#EAAA6A] rounded-2xl p-6 items-center mb-6">
          <Ionicons name="key" size={24} color="#fff" />
          <Text className="text-white font-inter mt-2">Código do Cliente</Text>
          <View className="bg-white rounded-3xl px-6 py-2 my-2">
            <Text className="text-2xl font-interBold text-[#EAAA6A]">#A3F92</Text>
          </View>
          <Text className="text-sm text-white/80 font-interBold text-center">
            Peça esse código ao cliente na retirada
          </Text>
        </View>

        <View className="mb-6">
          <View className="flex-row items-center gap-2 mb-4 opacity-60">
            <Ionicons name="location" size={16} color="#000" />
            <Text className="font-interBold text-lg">Status do Pedido</Text>
          </View>

          <View className="flex-row items-start">
          {STATUS_STEPS.map((step, i) => (
            <View key={step.key} className="flex-1 items-center">
              <View className="flex-row items-center w-full">
                <View
                  className={`flex-1 h-0.5 ${
                    i === 0
                      ? "opacity-0"
                      : i - 1 < statusIndex
                      ? "bg-[#EAAA6A]"
                      : "bg-gray-200"
                  }`}
                />
                <View
                  className={`w-12 h-12 rounded-full items-center justify-center ${
                    i <= statusIndex ? "bg-[#EAAA6A]" : "bg-gray-200"
                  }`}
                >
                  <Ionicons
                    name={step.icon as any}
                    size={16}
                    color={i <= statusIndex ? "#fff" : "#999"}
                  />
                </View>
                <View
                  className={`flex-1 h-0.5 ${
                    i === STATUS_STEPS.length - 1
                      ? "opacity-0"
                      : i < statusIndex
                      ? "bg-[#EAAA6A]"
                      : "bg-gray-200"
                  }`}
                />
              </View>

              <Text
                numberOfLines={1}
                className={`text-sm mt-1 font-interBold text-center w-16 ${
                  i <= statusIndex ? "text-[#EAAA6A]" : "text-gray-300"
                }`}
              >
                {step.label}
              </Text>
            </View>
          ))}
          </View>
        </View>

        <View className="flex gap-2">
          <Pressable className="w-full bg-[#EAAA6A] py-4 rounded-full flex-row items-center justify-center gap-2 mb-2 active:opacity-65">
            <Ionicons name="checkmark" size={18} color="#fff" />
            <Text className="font-interBold text-white text-base">
              Marcar como Pronto
            </Text>
          </Pressable>
          <Pressable className="w-full bg-white py-4 border-2 border-[#EAAA6A] rounded-full flex-row items-center justify-center gap-2 mb-2 active:opacity-50">
            <Ionicons name="storefront" size={18} color="#EAAA6A" />
            <Text className="font-interBold text-[#EAAA6A] text-base">
              Confirmar Retirada em Loja
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}