import { api } from "@/src/services/api/api";

export type ApiOrderStatus = "AWAIT_PAYMENT" | "COMPLETED";

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

export interface OrderDetail {
  id: string;
  productId: number;
  productName: string;
  shopkeeperId: number;
  shopkeeperName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  status: string; // ver com meu backenzo :)
  transactionId: string;
  createdAt: string;
  pickupCode: string | null;
}

export async function getShopkeeperOrders(status?: ApiOrderStatus): Promise<ApiOrder[]> {
  const { data } = await api.get<ApiOrder[]>("/orders/shopkeeper", {
    params: status ? { status } : undefined,
  });
  return data;
}

export async function getOrderById(id: string): Promise<OrderDetail> {
  const { data } = await api.get<OrderDetail>(`/orders/${id}`);
  return data;
}