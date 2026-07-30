// src/features/user/payment/hooks/useCheckout.ts
import { useMutation } from "@tanstack/react-query";
import { checkoutOrder } from "@/src/features/user/payment/services/orderService";
import { useOrderStore } from "@/src/stores/user/payment/orderStore";

export function useCheckout() {
  const setOrder = useOrderStore((s) => s.setOrder);

  return useMutation({
    mutationFn: (productId: number) => checkoutOrder(productId),
    onSuccess: (order) => setOrder(order),
  });
}