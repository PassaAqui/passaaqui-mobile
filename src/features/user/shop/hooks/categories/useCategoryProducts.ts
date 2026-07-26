import { useQuery } from "@tanstack/react-query";
import { getCategoryById } from "@/src/features/category/services/categoryService";

export function useCategoryProducts(categoryId: number | undefined) {
  return useQuery({
    queryKey: ["category-products", categoryId],
    queryFn: () => getCategoryById(categoryId!),
    enabled: !!categoryId,
    staleTime: 2 * 60 * 1000,
  });
}