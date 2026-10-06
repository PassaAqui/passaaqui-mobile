import { api } from "@/src/services/api/api";

export type ProductRating = {
  id: number;
  product_id: number;
  product_name: string;
  order_id: string;
  rating: number;
  comment: string | null;
  photos: string[];
  video: string | null;
  created_at: string;
};

export async function getProductRatings(productId: number): Promise<ProductRating[]> {
  const { data } = await api.get<ProductRating[]>(`/products/${productId}/ratings`);
  return data ?? [];
}