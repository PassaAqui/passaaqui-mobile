import { useQuery } from "@tanstack/react-query";
import { getOrder } from "@/src/features/user/payment/services/orderService";

export function useOrder(orderId: string | undefined) {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: () => getOrder(orderId!),
    enabled: !!orderId,
  });
}