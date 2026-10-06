import { api } from "@/src/services/api/api";
import { ReviewMedia } from "@/src/features/user/purchased/hooks/useReviewMedia";

export interface CreateReviewPayload {
  productId: string;
  rating: number;
  comment?: string;
  photos: ReviewMedia[];
  videos: ReviewMedia[];
}

export interface ProductReview {
  id: number;
  productId: number;
  productName: string;
  orderId: string;
  rating: number;
  comment: string | null;
  photos: string[];
  video: string | null;
  createdAt: string;
}

export interface ProductReviewRaw {
  id: number;
  product_id: number;
  product_name: string;
  order_id: string;
  rating: number;
  comment: string | null;
  photos: string[] | null;
  video: string | null;
  created_at: string;
}

function getMediaMimeType(name: string, kind: ReviewMedia["type"]): string {
  const ext = name.split(".").pop()?.toLowerCase();

  if (kind === "image") {
    switch (ext) {
      case "png":
        return "image/png";
      case "webp":
        return "image/webp";
      case "jpg":
      case "jpeg":
        return "image/jpeg";
      default:
        return "image/jpeg";
    }
  }

  switch (ext) {
    case "mov":
      return "video/quicktime";
    case "m4v":
      return "video/x-m4v";
    case "webm":
      return "video/webm";
    default:
      return "video/mp4";
  }
}

export function normalizeProductReview(raw: ProductReviewRaw): ProductReview {
  return {
    id: raw.id,
    productId: raw.product_id,
    productName: raw.product_name,
    orderId: raw.order_id,
    rating: raw.rating,
    comment: raw.comment ?? null,
    photos: raw.photos ?? [],
    video: raw.video ?? null,
    createdAt: raw.created_at,
  };
}

export async function createProductReview(payload: CreateReviewPayload): Promise<ProductReview> {
  const formData = new FormData();

  formData.append("rating", String(payload.rating));
  if (payload.comment?.trim()) {
    formData.append("comment", payload.comment.trim());
  }
  formData.append("order_id", payload.productId);

  payload.photos.forEach((photo) => {
    formData.append("photos", {
      uri: photo.uri,
      name: photo.name,
      type: getMediaMimeType(photo.name, "image"),
    } as any);
  });

  payload.videos.forEach((video) => {
    formData.append("video", {
      uri: video.uri,
      name: video.name,
      type: getMediaMimeType(video.name, "video"),
    } as any);
  });

  const { data } = await api.post<ProductReviewRaw>(
    `/products/${encodeURIComponent(payload.productId)}/ratings`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  return normalizeProductReview(data);
}