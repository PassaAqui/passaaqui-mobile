import { useQuery } from "@tanstack/react-query";
import { getShopkeeperOrders } from "@/src/features/shopkeeper/orders/services/ordersService";

export function useShopkeeperOrders() {
  return useQuery({
    queryKey: ["shopkeeper-orders"],
    queryFn: () => getShopkeeperOrders(),
    staleTime: 15 * 60 * 1000
  });
}