import { StatusType, STATUS_CONFIG } from "@/src/features/shopkeeper/orders/utils/orderMapper";

const RAW_STATUS_TO_DISPLAY: Record<string, StatusType> = {
  AWAIT_PAYMENT: "Pendente",
  COMPLETED: "Concluído",
};

const FALLBACK_STATUS: StatusType = "Pendente";

export function resolveDetailStatus(rawStatus: string): StatusType {
  const resolved = RAW_STATUS_TO_DISPLAY[rawStatus];

  if (!resolved) {
    console.warn(`[orders] status desconhecido recebido da API: "${rawStatus}". Usando fallback "${FALLBACK_STATUS}".`);
    return FALLBACK_STATUS;
  }

  return resolved;
}

export function resolveDetailStatusConfig(rawStatus: string) {
  return STATUS_CONFIG[resolveDetailStatus(rawStatus)];
}