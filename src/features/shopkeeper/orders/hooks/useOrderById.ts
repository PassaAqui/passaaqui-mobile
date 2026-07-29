import { useQuery } from "@tanstack/react-query";
import { getOrderById } from "@/src/features/shopkeeper/orders/services/ordersService";

export function useOrderById(id: string | undefined) {
  return useQuery({
    queryKey: ["order-detail", id],
    queryFn: () => getOrderById(id!),
    enabled: !!id,
    staleTime: 15 * 60 * 1000
  });
}