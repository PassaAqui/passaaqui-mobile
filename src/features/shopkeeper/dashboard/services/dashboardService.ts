import { api } from "@/src/services/api/api";

export interface WeeklySale {
  day: string;
  total: number;
}

export interface RecentOrderItem {
  name: string;
  quantity: number;
}

export type OrderApiStatus = "PENDING" | "CONFIRMED" | "PREPARING" | "READY" | "COMPLETED" | "CANCELLED";

export interface RecentOrder {
  id: string;
  customerName: string;
  createdAt: string;
  status: OrderApiStatus;
  code: string;
  total: number;
  items: RecentOrderItem[];
}

export interface Dashboard {
  ordersToday: number;
  revenueToday: number;
  activeProducts: number;
  pendingOrders: number;
  weeklySales: WeeklySale[];
  recentOrders: RecentOrder[];
}

interface RecentOrderRaw {
  id: string;
  customer_name: string;
  created_at: string;
  status: OrderApiStatus;
  code: string;
  total: number;
  items: RecentOrderItem[];
}

interface DashboardRaw {
  orders_today: number;
  revenue_today: number;
  active_products: number;
  pending_orders: number;
  weekly_sales: WeeklySale[];
  recent_orders: RecentOrderRaw[];
}

function normalizeRecentOrder(raw: RecentOrderRaw): RecentOrder {
  return {
    id: raw.id,
    customerName: raw.customer_name,
    createdAt: raw.created_at,
    status: raw.status,
    code: raw.code,
    total: raw.total,
    items: raw.items,
  };
}

function normalizeDashboard(raw: DashboardRaw): Dashboard {
  return {
    ordersToday: raw.orders_today,
    revenueToday: raw.revenue_today,
    activeProducts: raw.active_products,
    pendingOrders: raw.pending_orders,
    weeklySales: raw.weekly_sales,
    recentOrders: raw.recent_orders.map(normalizeRecentOrder),
  };
}

export async function getDashboard(): Promise<Dashboard> {
  const { data } = await api.get<DashboardRaw>("/dashboard");
  return normalizeDashboard(data);
}