import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useShopkeeperOrders } from "@/src/features/shopkeeper/orders/hooks/useShopkeeperOrders";
import { useUpdateOrderStatus } from "@/src/features/shopkeeper/orders/hooks/useUpdateOrderStatus";
import { mapToDisplayOrder, StatusType } from "@/src/features/shopkeeper/orders/utils/orderMapper";

const STATUS_STEPS: { key: StatusType; icon: string; label: string }[] = [
  { key: "Pendente",    icon: "checkmark",  label: "Recebido" },
  { key: "Em Preparo",  icon: "restaurant", label: "Em Preparo" },
  { key: "Concluído",   icon: "storefront", label: "Pronto para Retirada" },
];

export default function PrepareOrderScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: apiOrders, isLoading, isError } = useShopkeeperOrders();
  const { mutate: updateStatus, isPending } = useUpdateOrderStatus();

  const apiOrder = apiOrders?.find((o) => o.id === id);
  const order = apiOrder ? mapToDisplayOrder(apiOrder) : null;

  if (isLoading) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator color="#EAAA6A" />
      </SafeAreaView>
    );
  }

  if (isError || !order) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-white items-center justify-center px-8">
        <Ionicons name="alert-circle-outline" size={44} color="#8A8A8A" />
        <Text className="font-inter text-gray-500 mt-3 text-center">Pedido não encontrado</Text>
        <Pressable onPress={() => router.back()} className="mt-5">
          <Text className="font-inter text-[#EAAA6A] text-base">Voltar</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const statusIndex = STATUS_STEPS.findIndex((s) => s.key === order.status);
  const isReady = order.status === "Concluído";

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
              <Text className="text-2xl font-interBold text-white">#{order.code}</Text>
            </View>
            <View className="bg-white rounded-full items-center justify-center px-3 py-1">
              <Text className="text-sm text-center text-[#EAAA6A] font-inter">{order.status}</Text>
            </View>
          </View>
          <View className="flex-row items-center gap-2 mt-1">
            <Ionicons name="person" size={16} color="#fff" />
            <Text className="text-white font-inter">{order.name}</Text>
          </View>
          <View className="flex-row items-center gap-2 mt-1">
            <Ionicons name="time" size={16} color="#fff" />
            <Text className="text-white font-inter">Solicitado {order.time.toLowerCase()}</Text>
          </View>
        </View>

        <View className="flex-row items-center gap-2 mb-4 opacity-60">
          <Ionicons name="bag" size={16} color="#000" />
          <Text className="text-lg font-interBold">Itens do Pedido</Text>
        </View>

        {order.itemsList.map((item, i) => (
          <View key={i} className="flex-row items-center border border-gray-200 rounded-xl p-4 mb-2">
            <View className="bg-gray-100 rounded-lg px-3 py-2 mr-4">
              <Text className="text-sm font-inter">x{item.quantity}</Text>
            </View>
            <View className="flex-1">
              <Text className="font-interBold">{item.name}</Text>
            </View>
          </View>
        ))}

        <View className="flex-row items-center justify-end gap-1 mt-2 mb-5">
          <Ionicons name="receipt-outline" size={14} color="#888" />
          <Text className="text-sm text-gray-500 font-inter">
            Total: {order.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </Text>
        </View>

        <View className="bg-[#EAAA6A] rounded-2xl p-6 items-center mb-6">
          <Ionicons name="key" size={24} color="#fff" />
          <Text className="text-white font-inter mt-2">Código do Cliente</Text>
          <View className="bg-white rounded-3xl px-6 py-2 my-2">
            <Text className="text-2xl font-interBold text-[#EAAA6A]">#{order.code}</Text>
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
                  <View className={`flex-1 h-0.5 ${i === 0 ? "opacity-0" : i - 1 < statusIndex ? "bg-[#EAAA6A]" : "bg-gray-200"}`} />
                  <View className={`w-12 h-12 rounded-full items-center justify-center ${i <= statusIndex ? "bg-[#EAAA6A]" : "bg-gray-200"}`}>
                    <Ionicons name={step.icon as any} size={16} color={i <= statusIndex ? "#fff" : "#999"} />
                  </View>
                  <View className={`flex-1 h-0.5 ${i === STATUS_STEPS.length - 1 ? "opacity-0" : i < statusIndex ? "bg-[#EAAA6A]" : "bg-gray-200"}`} />
                </View>
                <Text numberOfLines={1} className={`text-sm mt-1 font-interBold text-center w-16 ${i <= statusIndex ? "text-[#EAAA6A]" : "text-gray-300"}`}>
                  {step.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className="flex gap-2">
          {!isReady && (
            <Pressable
              className="w-full bg-[#EAAA6A] py-4 rounded-full flex-row items-center justify-center gap-2 mb-2 active:opacity-65"
              disabled={isPending}
              onPress={() => updateStatus({ id: order.id, status: "COMPLETED" })}
            >
              {isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={18} color="#fff" />
                  <Text className="font-interBold text-white text-base">Marcar como Pronto</Text>
                </>
              )}
            </Pressable>
          )}
          <Pressable className="w-full bg-white py-4 border-2 border-[#EAAA6A] rounded-full flex-row items-center justify-center gap-2 mb-2 active:opacity-50">
            <Ionicons name="storefront" size={18} color="#EAAA6A" />
            <Text className="font-interBold text-[#EAAA6A] text-base">Confirmar Retirada em Loja</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}