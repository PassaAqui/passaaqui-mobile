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

export interface ProductModel {
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
  shopkeeper: { id: number; name: string; companyName?: string };
  poi?: { id: number; name: string; type: string };
  createdAt: string;
  updatedAt: string;
}

export async function createProduct(payload: CreateProductPayload): Promise<ProductModel> {
  const { data } = await api.post<ProductModel>("/products", payload);
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

export interface UpdateProductPayload {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  active?: boolean;
  highlight?: boolean;
  categoryId?: number;
}

export async function uploadProductImage(productId: number, imageUri: string, imageName: string): Promise<ProductModel> {
  const formData = new FormData();
  formData.append("image", {
    uri: imageUri,
    name: imageName,
    type: getImageMimeType(imageName),
  } as any);

  const { data } = await api.post<ProductModel>(`/products/${productId}/images`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function getProductById(id: number): Promise<ProductModel> {
  const { data } = await api.get<ProductModel>(`/products/${id}`);
  return data;
}

export async function updateProduct(id: number, payload: UpdateProductPayload): Promise<ProductModel> {
  const { data } = await api.put<ProductModel>(`/products/${id}`, payload);
  return data;
}

export async function deleteProduct(id: number): Promise<void> {
  await api.delete(`/products/${id}`);
}

export async function deleteProductImage(id: number, index: number): Promise<ProductModel> {
  const { data } = await api.delete<ProductModel>(`/products/${id}/images/${index}`);
  return data;
}