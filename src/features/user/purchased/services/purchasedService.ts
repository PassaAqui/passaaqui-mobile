import { api } from "@/src/services/api/api";

export type PurchasedProductStatus = "UNREDEEMED" | "REDEEMED";

export interface PurchasedProduct {
  orderId: string;
  productName: string;
  imageUrl: string | null;
  status: PurchasedProductStatus;
  expirationDate: string | null;
  redemptionDate: string | null;
}

export interface PurchasedProducts {
  unredeemed: PurchasedProduct[];
  redeemed: PurchasedProduct[];
}

interface PurchasedProductRaw {
  order_id: string;
  product_name: string;
  image_url: string | null;
  status: PurchasedProductStatus;
  expiration_date: string | null;
  redemption_date: string | null;
}

interface PurchasedProductsRaw {
  unredeemed: PurchasedProductRaw[] | null;
  redeemed: PurchasedProductRaw[] | null;
}

function normalizePurchasedProduct(raw: PurchasedProductRaw): PurchasedProduct {
  return {
    orderId: raw.order_id,
    productName: raw.product_name,
    imageUrl: raw.image_url ?? null,
    status: raw.status,
    expirationDate: raw.expiration_date ?? null,
    redemptionDate: raw.redemption_date ?? null,
  };
}

function normalizePurchasedProducts(raw: PurchasedProductsRaw): PurchasedProducts {
  return {
    unredeemed: (raw.unredeemed ?? []).map(normalizePurchasedProduct),
    redeemed: (raw.redeemed ?? []).map(normalizePurchasedProduct),
  };
}

export async function getPurchasedProducts(): Promise<PurchasedProducts> {
  const { data } = await api.get<PurchasedProductsRaw>("/orders/purchased-products");
  return normalizePurchasedProducts(data);
}
