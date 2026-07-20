// src/features/user/shop/services/categoryService.ts
import { api } from "@/src/services/api/api";

interface CategoryResponse {
  id: number;
  name: string;
  description: string;
}

export interface CategoryProduct {
  id: number;
  name: string;
  description: string | null;
  price: number;
  maxXp: number | null;
  stock: number;
  image: string | null;
  averageRating: number | null;
  ratingsCount: number | null;
  shopkeeper: { id: number; name: string };
  category: { id: number; name: string };
  createdAt: string;
  updatedAt: string;
}

interface CategoryWithProducts {
  id: number;
  name: string;
  description: string;
  products: {
    content: CategoryProduct[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
    first: boolean;
    last: boolean;
  };
}

export async function getAllCategories(): Promise<CategoryResponse[]> {
  const { data } = await api.get<CategoryResponse[]>("/categories");
  console.log("[categoryService/getAllCategories LOG] - Categorias encontradas: ", data);
  return data;
}

export async function getCategoryById(id: number, page = 0, size = 20): Promise<CategoryWithProducts> {
  const { data } = await api.get<CategoryWithProducts>(`/categories/${id}`, {
    params: { page, size },
  });
  console.log("[categoryService/getCategoryById LOG] - Categoria e produtos: ", data);
  return data;
}