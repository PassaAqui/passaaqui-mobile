import { Ionicons } from "@expo/vector-icons";
import { ApiOrder, ApiOrderStatus } from "../services/ordersService";

export type StatusType = "Pendente" | "Em Preparo" | "Concluído";

export interface DisplayOrder {
  id: string;
  initials: string;
  name: string;
  time: string;
  items: string;
  code: string;
  status: StatusType;
  total: number;
  itemsList: { name: string; quantity: number }[];
}

export const STATUS_LABEL: Record<ApiOrderStatus, StatusType> = {
  PENDING: "Pendente",
  PREPARING: "Em Preparo",
  COMPLETED: "Concluído",
};

export const STATUS_API: Record<StatusType, ApiOrderStatus> = {
  Pendente: "PENDING",
  "Em Preparo": "PREPARING",
  Concluído: "COMPLETED",
};

export const NEXT_STATUS: Record<StatusType, StatusType | null> = {
  Pendente: "Em Preparo",
  "Em Preparo": "Concluído",
  Concluído: null,
};

export const NEXT_LABEL: Record<StatusType, string> = {
  Pendente: "Iniciar preparo",
  "Em Preparo": "Marcar como concluído",
  Concluído: "",
};

export const STATUS_CONFIG: Record<StatusType, {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  bgColor: string;
  textColor: string;
  label: string;
}> = {
  Pendente:     { icon: "hourglass-outline", iconColor: "#8A8A8A", bgColor: "#F3F3F3", textColor: "#8A8A8A", label: "Pendente"   },
  "Em Preparo": { icon: "flame",             iconColor: "#E7A35A", bgColor: "#FBE6CF", textColor: "#E7A35A", label: "Em Preparo" },
  Concluído:    { icon: "checkmark-circle",  iconColor: "#22C55E", bgColor: "#DCFCE7", textColor: "#22C55E", label: "Concluído"  },
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

function formatRelativeTime(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffMin = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMin < 1) return "Agora";
  if (diffMin < 60) return `Há ${diffMin} min`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `Há ${diffHours}h`;

  const diffDays = Math.floor(diffHours / 24);
  return `Há ${diffDays}d`;
}

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function mapToDisplayOrder(order: ApiOrder): DisplayOrder {
  return {
    id: order.id,
    initials: getInitials(order.customer_name),
    name: order.customer_name,
    time: formatRelativeTime(order.created_at),
    items: order.items.map((i) => `${i.quantity}x ${i.name}`).join(", "),
    code: order.code.replace(/^#/, ""),
    status: STATUS_LABEL[order.status],
    total: order.total,
    itemsList: order.items.map((i) => ({
      name: i.name,
      quantity: i.quantity
    })) as any,
  };
}

export { formatCurrency };