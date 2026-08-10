import type {
  Order,
  OrderStatusUpdate,
} from "@/src/features/user/payment/types/order";

export const order: Order = {
  id: "ord-1",
  productId: 1,
  productName: "Café especial",
  shopkeeperId: 2,
  shopkeeperName: "Café do Recife",
  quantity: 1,
  unitPrice: 19.9,
  totalAmount: 19.9,
  status: "AWAITING_PAYMENT",
  transactionId: "tx-1",
  createdAt: "2026-08-10T00:00:00.000Z",
  pix: "00020126580014BR.GOV.BCB.PIX0136a71a7c0c-000201",
  qrCodeBase64: "base64-seed",
  pixExpiresAt: "2026-08-10T00:10:00.000Z",
  pickupCode: null,
};

export const paidOrder: Order = {
  ...order,
  status: "PAID",
  pickupCode: "AB1020",
};

export const expiredOrder: Order = {
  ...order,
  status: "EXPIRED",
  pixExpiresAt: "2026-08-09T23:55:00.000Z",
};

export const orderStatusUpdate: OrderStatusUpdate = {
  id: "ord-1",
  status: "PAID",
  pickupCode: "AB1020",
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