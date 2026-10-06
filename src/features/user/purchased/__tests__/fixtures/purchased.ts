import type {
  PurchasedProduct,
  PurchasedProducts,
} from "@/src/features/user/purchased/services/purchasedService";

export const purchasedProductRaw = {
  order_id: "#A3F92",
  product_name: "Tapioca Clássica",
  image_url: "http://localhost:9000/test-bucket/products/tapioca.jpg",
  status: "UNREDEEMED" as const,
  expiration_date: "2026-04-20",
  redemption_date: null,
};

export const purchasedProduct: PurchasedProduct = {
  orderId: "#A3F92",
  productName: "Tapioca Clássica",
  imageUrl: "http://localhost:9000/test-bucket/products/tapioca.jpg",
  status: "UNREDEEMED",
  expirationDate: "2026-04-20",
  redemptionDate: null,
};

export const redeemedProductRaw = {
  order_id: "#B7C21",
  product_name: "Vaso de Cerâmica",
  image_url: "http://localhost:9000/test-bucket/products/vaso.jpg",
  status: "REDEEMED" as const,
  expiration_date: null,
  redemption_date: "2026-04-25",
};

export const redeemedProduct: PurchasedProduct = {
  orderId: "#B7C21",
  productName: "Vaso de Cerâmica",
  imageUrl: "http://localhost:9000/test-bucket/products/vaso.jpg",
  status: "REDEEMED",
  expirationDate: null,
  redemptionDate: "2026-04-25",
};

export const purchasedProductsRaw = {
  unredeemed: [purchasedProductRaw],
  redeemed: [redeemedProductRaw],
};

export const purchasedProducts: PurchasedProducts = {
  unredeemed: [purchasedProduct],
  redeemed: [redeemedProduct],
};

export const emptyPurchasedProducts: PurchasedProducts = {
  unredeemed: [],
  redeemed: [],
};

export function createAxiosError(status: number) {
  const error = new Error("Request failed") as Error & {
    isAxiosError: boolean;
    response: { status: number; data: unknown };
  };

  error.isAxiosError = true;
  error.response = { status, data: {} };

  return error;
}
