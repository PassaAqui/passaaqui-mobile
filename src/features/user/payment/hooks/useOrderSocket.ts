import { useEffect } from "react";
import { subscribeTopic } from "@/src/services/socket/stompClient";
import { useOrderStore } from "@/src/stores/user/payment/orderStore";
import { OrderStatusUpdate } from "@/src/features/user/payment/types/order";

export function useOrderSocket(
  orderId: string | undefined,
  onStatusChange?: (data: OrderStatusUpdate) => void
) {
  const updateStatus = useOrderStore((s) => s.updateStatus);

  useEffect(() => {
    if (!orderId) return;

    const unsubscribe = subscribeTopic(`/topic/orders/${orderId}`, (message) => {
      const data: OrderStatusUpdate = JSON.parse(message.body);
      updateStatus(data.status, data.pickupCode);
      onStatusChange?.(data);
    });

    return unsubscribe;
  }, [orderId]);
}