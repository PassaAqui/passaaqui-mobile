import { useQuery } from "@tanstack/react-query";
import { getProductById } from "@/src/features/shopkeeper/products/services/productService";

export function useProductById(id: number) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id),
    enabled: !!id,
  });
}