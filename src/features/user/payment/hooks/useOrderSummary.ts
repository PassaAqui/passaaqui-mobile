import { useQuery } from "@tanstack/react-query";
import { getOrderSummary } from "@/src/features/user/payment/services/orderService";

export function useOrderSummary(productId: number | undefined, xpToUse?: number) {
  return useQuery({
    queryKey: ["order-summary", productId, xpToUse],
    queryFn: () => getOrderSummary(productId!, xpToUse),
    enabled: !!productId,
  });
}
