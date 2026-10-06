import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProduct } from "@/src/features/shopkeeper/products/services/productService";

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopkeeper-products"] });
      queryClient.invalidateQueries({ queryKey: ["shopkeeper-product-metrics"] });
    },
  });
}