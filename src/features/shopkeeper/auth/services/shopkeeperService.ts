import { api } from "@/src/services/api/api";

export interface ShopkeeperMe {
  id: number;
  email: string;
  name: string;
  companyName: string;
  description: string | null;
  category: { id: number; name: string };
}

export async function getShopkeeperMe(): Promise<ShopkeeperMe> {
  const { data } = await api.get<ShopkeeperMe>("/shopkeepers/me");
  return data;
}