import { create } from "zustand";
import { Order, OrderStatus } from "@/src/features/user/payment/types/order";

interface OrderState {
  order: Order | null;
  setOrder: (order: Order) => void;
  updateStatus: (status: OrderStatus, pickupCode: string | null) => void;
  clearOrder: () => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  order: null,
  setOrder: (order) => set({ order }),
  updateStatus: (status, pickupCode) =>
    set((state) =>
      state.order ? { order: { ...state.order, status, pickupCode } } : state
    ),
  clearOrder: () => set({ order: null }),
}));