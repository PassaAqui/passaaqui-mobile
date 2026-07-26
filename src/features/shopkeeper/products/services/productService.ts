import { api } from "@/src/services/api/api";

export interface CreateProductPayload {
  name: string;
  description?: string;
  price?: number;
  stock?: number;
  active?: boolean;
  highlight?: boolean;
  shopkeeperId: number;
  categoryId: number;
  poiId: number;
}

export interface CreatedProduct {
  id: number;
  name: string;
  description: string | null;
  price: number;
  maxXp: number;
  stock: number;
  images: string[];
  active: boolean;
  highlight: boolean;
  category: { id: number; name: string };
  image: string | null;
  shopkeeper: { id: number; name: string; companyName: string };
  poi: { id: number; name: string; type: string };
  createdAt: string;
  updatedAt: string;
}

export async function createProduct(payload: CreateProductPayload): Promise<CreatedProduct> {
  const { data } = await api.post<CreatedProduct>("/products", payload);
  return data;
}

const getImageMimeType = (name: string): string => {
  const ext = name.split(".").pop()?.toLowerCase();

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

export async function uploadProductImage(productId: number, imageUri: string, imageName: string): Promise<CreatedProduct> {
  const formData = new FormData();
  formData.append("image", {
    uri: imageUri,
    name: imageName,
    type: getImageMimeType(imageName),
  } as any);

  const { data } = await api.post<CreatedProduct>(`/products/${productId}/images`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}