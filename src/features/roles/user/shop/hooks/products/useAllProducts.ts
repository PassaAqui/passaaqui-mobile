import { useQuery } from "@tanstack/react-query";
import { getAllProducts } from "@/src/features/product/services/productService";

export function useAllProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: getAllProducts,
    staleTime: 2 * 60 * 1000
  })
}