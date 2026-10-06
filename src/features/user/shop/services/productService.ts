import { api } from "@/src/services/api/api";

export interface Products {
  id: number;
  images?: string[];
  name: string;
  description: string | null;
  price: number;
  maxXp: number | null;
  stock: number;
  shopkeeperId: number;
  categoryId: number;
}

export interface ProductDetail {
  id: number;
  images?: string[];
  name: string;
  description: string;
  price: number;
  maxXp: number;
  stock: number;
  averageRating: number;
  ratingsCount: number;
  poi: {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    city: {
      id: number;
      microRegion: string;
      state: string;
    };
  };
  shopkeeper: {
    id: number;
    name: string;
  };
  category: {
    id: number;
    name: string;
  };
}

export async function getProductById(id: number): Promise<ProductDetail> {
  const { data } = await api.get<ProductDetail>(`/products/${id}`);
  return data;
}

export async function getAllProducts(): Promise<Products[]> {
  const { data } = await api.get<Products[]>("/products");
  console.log("[shopService/getAllProducts LOG] - Produtos encontrados: ", data);
  return data;
}