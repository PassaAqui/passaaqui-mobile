import { api } from "@/src/services/api/api";
import {
  Order,
  OrderSummary,
} from "@/src/features/user/payment/types/order";

export async function checkoutOrder(
  productId: number,
  xpToUse?: number
): Promise<Order> {
  const payload: { productId: number; xpToUse?: number } = { productId };

  if (xpToUse !== undefined) {
    payload.xpToUse = xpToUse;
  }

  const { data } = await api.post<Order>("/orders/checkout", payload);
  return data;
}

export async function getOrderSummary(
  productId: number,
  xpToUse?: number
): Promise<OrderSummary> {
  const params: { productId: number; xpToUse?: number } = { productId };

  if (xpToUse !== undefined) {
    params.xpToUse = xpToUse;
  }

  const { data } = await api.get<OrderSummary>("/orders/summary", { params });
  return data;
}

export async function getOrder(orderId: string): Promise<Order> {
  const { data } = await api.get<Order>(`/orders/${orderId}`);
  return data;
}

export async function getMyOrders(): Promise<Order[]> {
  const { data } = await api.get<Order[]>("/orders/my-history");
  return data;
}
