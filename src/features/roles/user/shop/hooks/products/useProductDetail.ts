import { useQuery } from "@tanstack/react-query";
import { getProductById } from "@/src/features/product/services/productService";

export function useProductDetail(id: number | undefined) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id!),
    enabled: !!id
  })
}