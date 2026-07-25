// src/features/user/shop/hooks/categories/useCategoryProducts.ts
import { useQuery } from "@tanstack/react-query";
import { getCategoryById } from "@/src/features/roles/user/shop/services/categoryService";

export function useCategoryProducts(categoryId: number | undefined) {
  return useQuery({
    queryKey: ["category-products", categoryId],
    queryFn: () => getCategoryById(categoryId!),
    enabled: !!categoryId,
    staleTime: 2 * 60 * 1000,
  });
}