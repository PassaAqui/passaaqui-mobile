import { useQuery } from "@tanstack/react-query";
import { getAllProducts } from "@/src/features/roles/user/shop/services/productService";

export function useAllProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: getAllProducts,
    staleTime: 2 * 60 * 1000
  })
}