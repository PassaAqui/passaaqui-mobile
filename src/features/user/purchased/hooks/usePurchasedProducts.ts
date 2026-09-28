import { useQuery } from "@tanstack/react-query";
import { getPurchasedProducts } from "@/src/features/user/purchased/services/purchasedService";

export function usePurchasedProducts() {
  return useQuery({
    queryKey: ["purchased-products"],
    queryFn: getPurchasedProducts,
    staleTime: 2 * 60 * 1000,
  });
}
