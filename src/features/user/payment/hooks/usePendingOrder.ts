import { useQuery } from "@tanstack/react-query";
import { getMyOrders } from "@/src/features/user/payment/services/orderService";

export function usePendingOrder() {
  return useQuery({
    queryKey: ["pending-order"],
    queryFn: async () => {
      const orders = await getMyOrders();
      return orders.find((order) => order.status === "AWAITING_PAYMENT") ?? null;
    },
  });
}
