import { api } from "@/src/services/api/api";

interface ProductDetail {
  id: number;
  image?: string ;
  name: string;
  description: string;
  price: number;
  maxXp: number;
  stock: number;
  averageRating: number; // número de estrelas
  ratingsCount: number; // quantidade de avaliações
  poi: {
    id: number;
    name: string;
    latitude: number;
    longitude: number
    city: {
      id: number;
      microRegion: string;
      state: string;
    }
  }
  shopkeeper: {
    id: number;
    name: string
  }
  category: {
    id: number;
    name: string
  }
}

export async function getProductById(id: number): Promise<ProductDetail> {
  const { data } = await api.get<ProductDetail>(`/products/${id}`);
  console.log("[shopService LOG] - resultado da busca do produto pelo id: ", JSON.stringify(data, null, 2));
  return data
}