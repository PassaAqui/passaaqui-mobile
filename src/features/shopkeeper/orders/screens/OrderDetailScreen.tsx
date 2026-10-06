import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useOrderById } from "@/src/features/shopkeeper/orders/hooks/useOrderById";
import { formatRelativeTime } from "@/src/features/shopkeeper/orders/utils/orderMapper";
import { resolveDetailStatusConfig } from "@/src/features/shopkeeper/orders/utils/orderDetailStatusAdapter";

export default function OrderDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: order, isLoading, isError } = useOrderById(id);

  if (isLoading) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-[#F8F5F2] items-center justify-center">
        <ActivityIndicator color="#E7A35A" />
      </SafeAreaView>
    );
  }

  if (isError || !order) {
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

  const cfg = resolveDetailStatusConfig(order.status);

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-[#F8F5F2]">
      <View className="flex-row items-center justify-between px-5 pt-5 pb-4 bg-[#F8F5F2] border-b border-[#E8E3DE]" style={{ paddingTop: insets.top }}>
        <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Voltar">
          <Ionicons name="chevron-back" size={24} color="#2D2D2D" />
        </TouchableOpacity>
        <Text className="text-xl font-interBold text-[#2D2D2D]">Pedido</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        <View className="px-5 pt-5 gap-4">
          <View className="bg-white border border-[#E8E3DE] rounded-2xl p-4 flex-row items-center">
            <View className="w-12 h-12 rounded-full bg-[#E7A35A] items-center justify-center">
              <Ionicons name="bag-handle-outline" size={20} color="white" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="font-inter text-base text-[#2D2D2D]" numberOfLines={1}>
                {order.productName}
              </Text>
              <View className="flex-row items-center mt-0.5">
                <Ionicons name="time-outline" size={12} color="#8A8A8A" />
                <Text className="font-inter text-xs text-[#8A8A8A] ml-1">
                  {formatRelativeTime(order.createdAt)}
                </Text>
              </View>
            </View>
            <View className="px-3 py-1.5 rounded-xl flex-row items-center" style={{ backgroundColor: cfg.bgColor }}>
              <Ionicons name={cfg.icon} size={13} color={cfg.textColor} />
              <Text className="ml-1 text-xs font-inter" style={{ color: cfg.textColor }}>{cfg.label}</Text>
            </View>
          </View>

          {order.pickupCode ? (
            <View className="bg-[#E7A35A] rounded-2xl p-5 items-center">
              <Text className="font-inter text-white text-xs">Código de retirada</Text>
              <Text className="font-interBold text-white text-3xl mt-1 tracking-widest">
                #{order.pickupCode}
              </Text>
            </View>
          ) : (
            <View className="bg-[#F3F3F3] rounded-2xl p-4 items-center flex-row justify-center gap-2">
              <Ionicons name="hourglass-outline" size={16} color="#8A8A8A" />
              <Text className="font-inter text-[#8A8A8A] text-sm">
                Código de retirada disponível após confirmação do pagamento
              </Text>
            </View>
          )}

          <View className="bg-white border border-[#E8E3DE] rounded-2xl p-4">
            <Text className="font-interBold text-base text-[#2D2D2D] mb-3">Item do pedido</Text>

            <View className="flex-row items-center justify-between py-2">
              <Text className="font-inter text-sm text-[#2D2D2D] flex-1" numberOfLines={1}>
                {order.quantity}x {order.productName}
              </Text>
              <Text className="font-inter text-sm text-[#8A8A8A]">
                {order.unitPrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </Text>
            </View>

            <View className="h-px bg-[#E8E3DE] my-3" />

            <View className="flex-row items-center justify-between">
              <Text className="font-inter text-base text-[#2D2D2D]">Total</Text>
              <Text className="font-interBold text-lg text-[#E7A35A]">
                {order.totalAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}