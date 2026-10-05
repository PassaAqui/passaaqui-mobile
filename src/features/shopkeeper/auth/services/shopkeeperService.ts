import { api } from "@/src/services/api/api";

export interface ShopkeeperMe {
  id: number;
  email: string;
  name: string;
  companyName: string;
  description: string | null;
  category: { id: number; name: string; description?: string | null };
  poi: {
    id: number;
    name: string;
    description?: string | null;
    imageUrl?: string | null;
    type?: string;
    latitude?: number;
    longitude?: number;
    city?: { id: number; name: string };
  };
  documentId?: string;
  image?: string | null;
  theme?: "LIGHT" | "DARK";
  createdAt?: string;
  updatedAt?: string;
}

export async function getShopkeeperMe(): Promise<ShopkeeperMe> {
  const { data } = await api.get<ShopkeeperMe>("/shopkeepers/me");
  return data;
}
