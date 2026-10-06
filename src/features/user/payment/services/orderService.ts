import { api } from "@/src/services/api/api";
import { Order } from "@/src/features/user/payment/types/order";

export async function checkoutOrder(productId: number): Promise<Order> {
  const { data } = await api.post<Order>("/orders/checkout", { productId });
  return data;
}

export async function getOrder(orderId: string): Promise<Order> {
  const { data } = await api.get<Order>(`/orders/${orderId}`);
  return data;
}