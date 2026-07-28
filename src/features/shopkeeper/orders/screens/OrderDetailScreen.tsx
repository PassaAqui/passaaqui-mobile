import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useShopkeeperOrders } from "@/src/features/shopkeeper/orders/hooks/useShopkeeperOrders";
import { useUpdateOrderStatus } from "@/src/features/shopkeeper/orders/hooks/useUpdateOrderStatus";
import { mapToDisplayOrder, STATUS_CONFIG, STATUS_API, NEXT_STATUS, NEXT_LABEL } from "@/src/features/shopkeeper/orders/utils/orderMapper";

export default function OrderDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: apiOrders, isLoading, isError } = useShopkeeperOrders();
  const { mutate: updateStatus, isPending } = useUpdateOrderStatus();

  const apiOrder = apiOrders?.find((o) => o.id === id);
  const order = apiOrder ? mapToDisplayOrder(apiOrder) : null;

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

  const cfg = STATUS_CONFIG[order.status];
  const next = NEXT_STATUS[order.status];

  const handleAdvanceStatus = () => {
    if (!next) return;
    updateStatus({ id: order.id, status: STATUS_API[next] });
  };

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
              <Text className="ml-1 text-xs font-inter" style={{ color: cfg.textColor }}>{order.status}</Text>
            </View>
          </View>

          <View className="bg-[#E7A35A] rounded-2xl p-5 items-center">
            <Text className="font-inter text-white text-xs">Código de retirada</Text>
            <Text className="font-interBold text-white text-3xl mt-1 tracking-widest">
              #{order.code}
            </Text>
          </View>

          <View className="bg-white border border-[#E8E3DE] rounded-2xl p-4">
            <Text className="font-interBold text-base text-[#2D2D2D] mb-3">Itens do pedido</Text>
            {order.itemsList.map((item, i) => (
              <View key={i}>
                <View className="flex-row items-center justify-between py-2">
                  <Text className="font-inter text-sm text-[#2D2D2D] flex-1" numberOfLines={1}>
                    {item.quantity}x {item.name}
                  </Text>
                </View>
                {i < order.itemsList.length - 1 && <View className="h-px bg-[#E8E3DE]" />}
              </View>
            ))}
            <View className="h-px bg-[#E8E3DE] my-3" />
            <View className="flex-row items-center justify-between">
              <Text className="font-inter text-base text-[#2D2D2D]">Total</Text>
              <Text className="font-interBold text-lg text-[#E7A35A]">
                {order.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </Text>
            </View>
          </View>

          {next && (
            <TouchableOpacity
              className="bg-[#E7A35A] rounded-xl py-3.5 items-center flex-row justify-center gap-2"
              onPress={handleAdvanceStatus}
              disabled={isPending}
              accessibilityRole="button"
              accessibilityLabel={NEXT_LABEL[order.status]}
            >
              {isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="arrow-forward-circle-outline" size={18} color="white" />
                  <Text className="font-inter text-white text-base">{NEXT_LABEL[order.status]}</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}