import { useQuery } from "@tanstack/react-query";
import {
  getProductRatings,
  type ProductRating,
} from "@/src/features/user/shop/services/ratingService";

export type { ProductRating } from "@/src/features/user/shop/services/ratingService";

export function getAverageRating(ratings: ProductRating[]) {
  if (ratings.length === 0) return 0;
  return ratings.reduce((sum, item) => sum + item.rating, 0) / ratings.length;
}

export function useProductRatings(productId: number) {
  return useQuery({
    queryKey: ["product-ratings", productId],
    queryFn: () => getProductRatings(productId),
    enabled: !!productId,
  });
}