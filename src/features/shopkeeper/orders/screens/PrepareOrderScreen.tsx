import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useOrderById } from "@/src/features/shopkeeper/orders/hooks/useOrderById";
import { formatRelativeTime } from "@/src/features/shopkeeper/orders/utils/orderMapper";
import { resolveDetailStatus, resolveDetailStatusConfig } from "@/src/features/shopkeeper/orders/utils/orderDetailStatusAdapter";
import { StatusType } from "@/src/features/shopkeeper/orders/utils/orderMapper";

const STATUS_STEPS: { key: StatusType; icon: string; label: string }[] = [
  { key: "Pendente",  icon: "hourglass", label: "Aguardando Pagamento" },
  { key: "Concluído", icon: "storefront", label: "Pronto para Retirada" },
];

export default function PrepareOrderScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: order, isLoading, isError } = useOrderById(id);

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

  const status = resolveDetailStatus(order.status);
  const cfg = resolveDetailStatusConfig(order.status);
  const statusIndex = STATUS_STEPS.findIndex((s) => s.key === status);

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-white">
      <View className="flex-row items-center justify-center p-6">
        <Pressable className="absolute left-5" onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </Pressable>
        <Text className="text-lg font-interBold">Detalhes do Pedido</Text>
      </View>

      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: insets.bottom + 16 }} showsVerticalScrollIndicator={false}>
        <View className="bg-[#EAAA6A] rounded-2xl p-5 mb-5">
          <View className="flex-row justify-between mb-2">
            <View className="flex-row items-center gap-2">
              <Ionicons name="document-text" size={20} color="#fff" />
              <Text className="text-2xl font-interBold text-white" numberOfLines={1}>
                {order.productName}
              </Text>
            </View>
            <View className="bg-white rounded-full items-center justify-center px-3 py-1">
              <Text className="text-sm text-center font-inter" style={{ color: cfg.textColor === "#22C55E" ? "#22C55E" : "#EAAA6A" }}>
                {cfg.label}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center gap-2 mt-1">
            <Ionicons name="time" size={16} color="#fff" />
            <Text className="text-white font-inter">
              Solicitado {formatRelativeTime(order.createdAt).toLowerCase()}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center gap-2 mb-4 opacity-60">
          <Ionicons name="bag" size={16} color="#000" />
          <Text className="text-lg font-interBold">Item do Pedido</Text>
        </View>

        <View className="flex-row items-center border border-gray-200 rounded-xl p-4 mb-2">
          <View className="bg-gray-100 rounded-lg px-3 py-2 mr-4">
            <Text className="text-sm font-inter">x{order.quantity}</Text>
          </View>
          <View className="flex-1">
            <Text className="font-interBold">{order.productName}</Text>
          </View>
          <Text className="text-[#EAAA6A] font-interBold">
            {order.unitPrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </Text>
        </View>

        <View className="flex-row items-center justify-end gap-1 mt-2 mb-5">
          <Ionicons name="receipt-outline" size={14} color="#888" />
          <Text className="text-sm text-gray-500 font-inter">
            Total: {order.totalAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </Text>
        </View>

        {order.pickupCode ? (
          <View className="bg-[#EAAA6A] rounded-2xl p-6 items-center mb-6">
            <Ionicons name="key" size={24} color="#fff" />
            <Text className="text-white font-inter mt-2">Código do Cliente</Text>
            <View className="bg-white rounded-3xl px-6 py-2 my-2">
              <Text className="text-2xl font-interBold text-[#EAAA6A]">#{order.pickupCode}</Text>
            </View>
            <Text className="text-sm text-white/80 font-interBold text-center">
              Peça esse código ao cliente na retirada
            </Text>
          </View>
        ) : (
          <View className="bg-gray-100 rounded-2xl p-6 items-center mb-6">
            <Ionicons name="hourglass-outline" size={24} color="#8A8A8A" />
            <Text className="text-gray-500 font-inter mt-2 text-center">
              Código de retirada disponível após a confirmação do pagamento
            </Text>
          </View>
        )}

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
                <Text numberOfLines={1} className={`text-sm mt-1 font-interBold text-center w-20 ${i <= statusIndex ? "text-[#EAAA6A]" : "text-gray-300"}`}>
                  {step.label}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}