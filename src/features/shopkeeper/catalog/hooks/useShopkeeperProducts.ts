import { useQuery } from "@tanstack/react-query";
import { getShopkeeperProducts } from "@/src/features/shopkeeper/catalog/services/shopkeeperProductsService";

export function useShopkeeperProducts(inStock?: boolean) {
  return useQuery({
    queryKey: ["shopkeeper-products", { inStock }],
    queryFn: () => getShopkeeperProducts({ inStock }),
  });
}