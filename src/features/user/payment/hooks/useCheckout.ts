// src/features/user/payment/hooks/useCheckout.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { checkoutOrder } from "@/src/features/user/payment/services/orderService";
import { useOrderStore } from "@/src/stores/user/payment/orderStore";

interface CheckoutVariables {
  productId: number;
  xpToUse?: number;
}

export function useCheckout() {
  const setOrder = useOrderStore((s) => s.setOrder);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, xpToUse }: CheckoutVariables) =>
      checkoutOrder(productId, xpToUse),
    onSuccess: (order) => {
      setOrder(order);

      if (order.xpUsed && order.xpUsed > 0) {
        queryClient.setQueryData(["tourist-me"], (old: any) => {
          if (!old) return old;

          return {
            ...old,
            currentXP: Math.max(0, (old.currentXP ?? 0) - order.xpUsed!),
          };
        });
      }
    },
  });
}
