import { useQuery } from "@tanstack/react-query";
import { getAllCategories } from "@/src/features/user/shop/services/categoryService";

export function useAllCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: getAllCategories,
    staleTime: 30 * 60 * 1000
  })
}