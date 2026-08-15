import type {
  ApiOrder,
  OrderDetail,
} from "@/src/features/shopkeeper/orders/services/ordersService";
import type { DisplayOrder } from "@/src/features/shopkeeper/orders/utils/orderMapper";

// FIXED_NOW alinhado aos `it` do orderMapper.test.ts / telas:
// 2026-08-14T12:00:00Z → created_at 11:55Z produz "Há 5 min".
export const FIXED_NOW_ISO = "2026-08-14T12:00:00Z";

export const apiOrder: ApiOrder = {
  id: "ord-1",
  customer_name: "João Silva",
  created_at: "2026-08-14T11:55:00Z",
  status: "AWAIT_PAYMENT",
  code: "#AB1020",
  total: 42.9,
  items: [
    { name: "Café", quantity: 2 },
    { name: "Torta", quantity: 1 },
  ],
};

export const apiCompletedOrder: ApiOrder = {
  id: "ord-2",
  customer_name: "Ana",
  created_at: "2026-08-14T11:00:00Z",
  status: "COMPLETED",
  code: "CD2031",
  total: 35,
  items: [{ name: "Capuccino", quantity: 1 }],
};

export const apiOrders: ApiOrder[] = [apiOrder, apiCompletedOrder];

export const displayOrder: DisplayOrder = {
  id: "ord-1",
  initials: "JS",
  name: "João Silva",
  time: "Há 5 min",
  items: "2x Café, 1x Torta",
  code: "AB1020",
  status: "Pendente",
  total: 42.9,
};

export const displayCompletedOrder: DisplayOrder = {
  id: "ord-2",
  initials: "A",
  name: "Ana",
  time: "Há 1h",
  items: "1x Capuccino",
  code: "CD2031",
  status: "Concluído",
  total: 35,
};

export const orderDetail: OrderDetail = {
  id: "ord-1",
  productId: 5,
  productName: "Café especial",
  shopkeeperId: 2,
  shopkeeperName: "Café do Recife",
  quantity: 2,
  unitPrice: 19.9,
  totalAmount: 39.8,
  status: "AWAIT_PAYMENT",
  transactionId: "tx-1",
  createdAt: "2026-08-14T11:55:00Z",
  pickupCode: null,
};

export const orderDetailWithPickup: OrderDetail = {
  ...orderDetail,
  status: "COMPLETED",
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