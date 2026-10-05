import type { ShopkeeperMe } from "@/src/features/shopkeeper/auth/services/shopkeeperService";

export function getShopkeeperStoreImageUrl(
  shopkeeper?: Pick<ShopkeeperMe, "poi"> | null
): string | null {
  return shopkeeper?.poi?.imageUrl ?? null;
}
