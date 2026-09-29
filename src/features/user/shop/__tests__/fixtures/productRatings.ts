import type { ProductRating } from "@/src/features/user/shop/services/ratingService";

export const productRating: ProductRating = {
  id: 1,
  product_id: 10,
  product_name: "Tapioca Clássica",
  order_id: "#A3F92",
  rating: 5,
  comment: "Muito saborosa e crocante!",
  photos: ["http://localhost:9000/test-bucket/ratings/images/uuid-photo1.jpg"],
  video: "http://localhost:9000/test-bucket/ratings/videos/uuid-video.mp4",
  created_at: "2026-05-24T15:00:00",
};

export const productRatingMinimal: ProductRating = {
  id: 2,
  product_id: 10,
  product_name: "Tapioca Clássica",
  order_id: "#B7C21",
  rating: 3,
  comment: null,
  photos: [],
  video: null,
  created_at: "2026-05-26T10:00:00",
};

export function createAxiosError(status: number) {
  const error = new Error("Request failed") as Error & {
    isAxiosError: boolean;
    response: { status: number; data: unknown };
  };

  error.isAxiosError = true;
  error.response = { status, data: {} };

  return error;
}