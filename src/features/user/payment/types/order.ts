export type OrderStatus =
  | "AWAITING_PAYMENT"
  | "PAID"
  | "CANCELLED"
  | "EXPIRED";

export interface Order {
  id: string;
  productId: number;
  productName: string;
  shopkeeperId: number;
  shopkeeperName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  status: OrderStatus;
  transactionId: string;
  createdAt: string;
  pix: string;
  qrCodeBase64: string;
  pixExpiresAt: string;
  pickupCode: string | null;
}

export interface OrderStatusUpdate {
  id: string;
  status: OrderStatus;
  pickupCode: string | null;
}