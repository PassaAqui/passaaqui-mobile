import type { ProductReview } from "@/src/features/user/purchased/services/reviewService";
import type { ReviewMedia } from "@/src/features/user/purchased/hooks/useReviewMedia";

export const reviewRaw = {
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

export const review: ProductReview = {
  id: 1,
  productId: 10,
  productName: "Tapioca Clássica",
  orderId: "#A3F92",
  rating: 5,
  comment: "Muito saborosa e crocante!",
  photos: ["http://localhost:9000/test-bucket/ratings/images/uuid-photo1.jpg"],
  video: "http://localhost:9000/test-bucket/ratings/videos/uuid-video.mp4",
  createdAt: "2026-05-24T15:00:00",
};

export const photo: ReviewMedia = {
  uri: "file:///tmp/foto.jpg",
  name: "foto.jpg",
  type: "image",
};

export const video: ReviewMedia = {
  uri: "file:///tmp/video.mp4",
  name: "video.mp4",
  type: "video",
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