import type { Dashboard, RecentOrder, WeeklySale } from "@/src/features/shopkeeper/dashboard/services/dashboardService";

interface DashboardRaw {
  orders_today: number;
  revenue_today: number;
  active_products: number;
  pending_orders: number;
  weekly_sales: WeeklySale[];
  recent_orders: RecentOrderRaw[];
}

interface RecentOrderRaw {
  id: string;
  customer_name: string;
  created_at: string;
  status: RecentOrder["status"];
  code: string;
  total: number;
  items: RecentOrder["items"];
}

export const dashboardRaw: DashboardRaw = {
  orders_today: 12,
  revenue_today: 1500,
  active_products: 34,
  pending_orders: 3,
  weekly_sales: [
    { day: "Segunda", total: 120 },
    { day: "Terça", total: 80 },
  ],
  recent_orders: [
    {
      id: "ord-1",
      customer_name: "João",
      created_at: "2026-08-13T10:00:00Z",
      status: "PENDING",
      code: "AB1020",
      total: 42.9,
      items: [{ name: "Café", quantity: 2 }],
    },
  ],
};

export const dashboard: Dashboard = {
  ordersToday: 12,
  revenueToday: 1500,
  activeProducts: 34,
  pendingOrders: 3,
  weeklySales: [
    { day: "Segunda", total: 120 },
    { day: "Terça", total: 80 },
  ],
  recentOrders: [
    {
      id: "ord-1",
      customerName: "João",
      createdAt: "2026-08-13T10:00:00Z",
      status: "PENDING",
      code: "AB1020",
      total: 42.9,
      items: [{ name: "Café", quantity: 2 }],
    },
  ],
};

export const weeklySales: WeeklySale[] = [
  { day: "Segunda", total: 120 },
  { day: "Terça", total: 80 },
  { day: "Quarta", total: 60 },
  { day: "Quinta", total: 40 },
  { day: "Sexta", total: 0 },
];

export const recentOrders: RecentOrder[] = [
  {
    id: "ord-1",
    customerName: "João",
    createdAt: "2026-08-13T10:00:00Z",
    status: "PENDING",
    code: "AB1020",
    total: 42.9,
    items: [
      { name: "Café", quantity: 2 },
      { name: "Torta", quantity: 1 },
    ],
  },
  {
    id: "ord-2",
    customerName: "Ana",
    createdAt: "2026-08-13T09:00:00Z",
    status: "COMPLETED",
    code: "CD2031",
    total: 35,
    items: [
      { name: "Capuccino", quantity: 1 },
      { name: "Sanduíche", quantity: 1 },
    ],
  },
];