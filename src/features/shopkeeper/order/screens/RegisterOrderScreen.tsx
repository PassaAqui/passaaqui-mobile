import { View, Text, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

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

export default function OrderPreparationScreen() {
  const [status] = useState<OrderStatus>("preparing");
  const statusIndex = STATUS_STEPS.findIndex((s) => s.key === status);

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center justify-between px-5 py-5">
        <Ionicons name="chevron-back" size={24} color="#000" />
        <Text className="text-lg font-itim">Preparar Pedido</Text>
        <Ionicons name="ellipsis-vertical" size={20} color="#000" />
      </View>

      <ScrollView className="flex-1 px-5">
        <View className="bg-[#EAAA6A] rounded-2xl p-5 mb-5">
          <View className="flex-row justify-between mb-2">
            <View className="flex-row items-center gap-2">
              <Ionicons name="document-text" size={20} color="#fff" />
              <Text className="text-2xl font-bold text-white">#0042</Text>
            </View>
            <View className="bg-white rounded-full px-3 py-1">
              <Text className="text-xs text-[#EAAA6A] font-itim">Pendente</Text>
            </View>
          </View>
          <View className="flex-row items-center gap-2 mt-1">
            <Ionicons name="person" size={16} color="#fff" />
            <Text className="text-white font-itim">Maria Silva</Text>
          </View>
          <View className="flex-row items-center gap-2 mt-1">
            <Ionicons name="time" size={16} color="#fff" />
            <Text className="text-white font-itim">Solicitado há 3 minutos</Text>
          </View>
        </View>

        <Text className="text-base font-itim mb-4">
          <Ionicons name="bag" size={16} /> Itens do Pedido
        </Text>

        {ORDER_ITEMS.map((item, i) => (
          <View
            key={i}
            className="flex-row items-center border border-gray-200 rounded-xl p-4 mb-2"
          >
            <View className="bg-gray-100 rounded-lg px-3 py-2 mr-4">
              <Text className="text-sm font-itim">x{item.qty}</Text>
            </View>
            <View className="flex-1">
              <Text className="font-bold font-itim">{item.name}</Text>
              {item.note && (
                <Text className="text-xs text-gray-500 font-itim">{item.note}</Text>
              )}
            </View>
            <Text className="text-[#EAAA6A] font-bold font-itim">{item.price}</Text>
          </View>
        ))}

        <Text className="text-right text-sm text-gray-500 mt-2 mb-4 font-itim">
          Total: R$ 24,00
        </Text>

        <View className="bg-[#EAAA6A] rounded-2xl p-6 items-center mb-6">
          <Ionicons name="key" size={24} color="#fff" />
          <Text className="text-white font-itim mt-2">Código do Cliente</Text>
          <View className="bg-white rounded-3xl px-6 py-2 my-2">
            <Text className="text-2xl font-bold text-[#EAAA6A]">#A3F92</Text>
          </View>
          <Text className="text-xs text-white/80 font-itim">
            Peça esse código ao cliente na retirada
          </Text>
        </View>

        <View className="mb-6">
          <View className="flex-row items-center gap-2 mb-4">
            <Ionicons name="location" size={16} color="#000" />
            <Text className="font-itim">Status do Pedido</Text>
          </View>

          <View className="flex-row items-center">
            {STATUS_STEPS.map((step, i) => (
              <View key={step.key} className="flex-row items-center flex-1">
                <View className="items-center">
                  <View
                    className={`w-9 h-9 rounded-full items-center justify-center ${
                      i <= statusIndex ? "bg-[#EAAA6A]" : "bg-gray-200"
                    }`}
                  >
                    <Ionicons
                      name={step.icon as any}
                      size={16}
                      color={i <= statusIndex ? "#fff" : "#999"}
                    />
                  </View>
                  <Text
                    className={`text-[10px] mt-1 font-itim ${
                      i <= statusIndex ? "text-[#EAAA6A]" : "text-gray-300"
                    }`}
                  >
                    {step.label}
                  </Text>
                </View>
                {i < STATUS_STEPS.length - 1 && (
                  <View
                    className={`h-0.5 flex-1 mb-5 ${
                      i < statusIndex ? "bg-[#EAAA6A]" : "bg-gray-200"
                    }`}
                  />
                )}
              </View>
            ))}
          </View>
        </View>

        <Pressable className="w-full bg-[#EAAA6A] py-4 rounded-full items-center mb-2 active:opacity-70">
          <Text className="font-bold font-itim text-white text-base">
            Marcar como Pronto
          </Text>
        </Pressable>
        <Pressable className="w-full bg-white py-4 rounded-full items-center border-2 border-[#EAAA6A] mb-6 active:opacity-70">
          <Text className="font-bold font-itim text-[#EAAA6A] text-base">
            Confirmar Retirada em Loja
          </Text>
        </Pressable>
      </ScrollView>

      <View className="flex-row justify-around py-4 border-t border-gray-200 bg-white">
        <View className="items-center">
          <Ionicons name="home" size={20} color="#888" />
          <Text className="text-[11px] text-gray-500 font-itim">Home</Text>
        </View>
        <View className="items-center">
          <Ionicons name="bar-chart" size={20} color="#EAAA6A" />
          <Text className="text-[11px] text-[#EAAA6A] font-itim">Dashboard</Text>
        </View>
        <View className="items-center">
          <Ionicons name="cube" size={20} color="#888" />
          <Text className="text-[11px] text-gray-500 font-itim">Catálogo</Text>
        </View>
        <View className="items-center">
          <Ionicons name="person" size={20} color="#888" />
          <Text className="text-[11px] text-gray-500 font-itim">Perfil</Text>
        </View>
      </View>
    </View>
  );
}
