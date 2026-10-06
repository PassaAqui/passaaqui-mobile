import { useQuery } from "@tanstack/react-query";
import { getShopkeeperProductMetrics } from "@/src/features/shopkeeper/catalog/services/shopkeeperProductsService";

export function useShopkeeperProductMetrics() {
  return useQuery({
    queryKey: ["shopkeeper-product-metrics"],
    queryFn: getShopkeeperProductMetrics,
  });
}