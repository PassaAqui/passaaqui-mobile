import { api } from "@/src/services/api/api";

interface CategoryResponse {
  id: number;
  name: string;
  description: string;
}

export async function getAllCategories(): Promise<CategoryResponse[]> {
  const { data } = await api.get<CategoryResponse[]>("/categories");
  console.log("[categoryService/getAllCategories LOG] - Categorias encontradas: ", data);
  return data;
}