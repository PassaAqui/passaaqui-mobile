import { api } from "@/src/services/api/api";

export interface ShopkeeperProduct {
  id: number;
  name: string;
  price: number;
  image: string | null;
  active: boolean;
  highlight: boolean;
  category: string;
}

export interface ShopkeeperProductMetrics {
  total_products: number;
  active_products: number;
  highlight_products: number;
}

interface GetShopkeeperProductsParams {
  inStock?: boolean;
}

export async function getShopkeeperProducts(params?: GetShopkeeperProductsParams): Promise<ShopkeeperProduct[]> {
  try {
    const { data } = await api.get<ShopkeeperProduct[]>("/products/shopkeeper", {
      params: { inStock: params?.inStock },
    });
    console.log("[getShopkeeperProducts] sucesso:", data);
    return data;
  } catch (error) {
    console.log("[getShopkeeperProducts] ERRO:", error);
    throw error;
  }
}

export async function getShopkeeperProductMetrics(): Promise<ShopkeeperProductMetrics> {
  const { data } = await api.get<ShopkeeperProductMetrics>("/products/shopkeeper/metrics");
  console.log("[getShopkeeperProductMetrics/shopkeeperProductsService LOG] - Métricas do lojista encontradas: ", data)
  return data;
}