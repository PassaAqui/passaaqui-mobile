import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateOrderStatus, ApiOrderStatus } from "@/src/features/shopkeeper/orders/services/ordersService";

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ApiOrderStatus }) => updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopkeeper-orders"] });
    },
  });
}