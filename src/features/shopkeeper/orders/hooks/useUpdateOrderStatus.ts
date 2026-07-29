import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateOrderStatus, ApiOrderStatus } from "../services/ordersService";

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ApiOrderStatus }) => updateOrderStatus(id, status),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["shopkeeper-orders"] });
      queryClient.invalidateQueries({ queryKey: ["order-detail", variables.id] });
    },
  });
}