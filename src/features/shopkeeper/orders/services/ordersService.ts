import { api } from "@/src/services/api/api";

export type ApiOrderStatus = "PENDING" | "PREPARING" | "COMPLETED";

export interface ApiOrderItem {
  name: string;
  quantity: number;
}

export interface ApiOrder {
  id: string;
  customer_name: string;
  created_at: string;
  status: ApiOrderStatus;
  code: string;
  total: number;
  items: ApiOrderItem[];
}

export async function getShopkeeperOrders(status?: ApiOrderStatus): Promise<ApiOrder[]> {
  const { data } = await api.get<ApiOrder[]>("/orders/shopkeeper", {
    params: status ? { status } : undefined,
  });
  return data;
}

export async function updateOrderStatus(id: string, status: ApiOrderStatus): Promise<ApiOrder> {
  const { data } = await api.put<ApiOrder>(`/orders/${id}/status`, { status });
  return data;
}