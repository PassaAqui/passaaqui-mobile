import { useOrderStore } from "@/src/stores/user/payment/orderStore";
import {
  order,
  paidOrder,
} from "@/src/features/user/payment/__tests__/fixtures/payment";

beforeEach(() => {
  jest.clearAllMocks();
  useOrderStore.setState({ order: null });
});

describe("orderStore", () => {
  describe("setOrder", () => {
    it("define o pedido no estado", () => {
      // Act
      useOrderStore.getState().setOrder(order);

      // Assert
      expect(useOrderStore.getState().order).toBe(order);
    });

    it("sobrescreve o pedido anterior quando chamado duas vezes", () => {
      // Arrange
      useOrderStore.getState().setOrder(order);

      // Act
      useOrderStore.getState().setOrder(paidOrder);

      // Assert
      expect(useOrderStore.getState().order).toBe(paidOrder);
    });
  });

  describe("updateStatus", () => {
    it("atualiza status e pickupCode mantendo os demais campos do pedido", () => {
      // Arrange
      useOrderStore.getState().setOrder(order);

      // Act
      useOrderStore.getState().updateStatus("PAID", "AB1020");

      // Assert
      expect(useOrderStore.getState().order).toEqual(paidOrder);
    });

    it("não lança nem cria pedido quando não há pedido no estado", () => {
      // Act
      useOrderStore.getState().updateStatus("PAID", "AB1020");

      // Assert
      expect(useOrderStore.getState().order).toBeNull();
    });
  });

  describe("clearOrder", () => {
    it("volta o pedido a null após setOrder", () => {
      // Arrange
      useOrderStore.getState().setOrder(order);

      // Act
      useOrderStore.getState().clearOrder();

      // Assert
      expect(useOrderStore.getState().order).toBeNull();
    });
  });
});