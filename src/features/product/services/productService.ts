import { api } from "@/src/services/api/api";
import { ProductDetail } from "@/src/features/product/types";
import { Products } from "@/src/features/product/types";


export async function getProductById(id: number): Promise<ProductDetail> {
  const { data } = await api.get<ProductDetail>(`/products/${id}`);
  return data
}

export async function getAllProducts(): Promise<Products[]> {
  const { data } = await api.get<Products[]>("/products");
  console.log("[shopService/getAllProducts LOG] - Produtos encontrados: ", data);
  return data;
}