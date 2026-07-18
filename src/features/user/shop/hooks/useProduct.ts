import { useQuery } from "@tanstack/react-query";
import { getProductById } from "@/src/features/user/shop/services/shopService";

export function useProduct(id: number | undefined) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id!),
    enabled: !!id
  })
}