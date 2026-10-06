import { api } from "@/src/services/api/api";
import {
  getOrderById,
  getShopkeeperOrders,
} from "@/src/features/shopkeeper/orders/services/ordersService";
import {
  apiOrders,
  createAxiosError,
  orderDetail,
} from "@/src/features/shopkeeper/orders/__tests__/fixtures/orders";

// Mock HTTP: `api` (client central) para as chamadas de /orders.
jest.mock("@/src/services/api/api", () => ({
  api: {
    get: jest.fn(),
  },
}));

const mockedApi = api as jest.Mocked<typeof api>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("ordersService", () => {
  describe("getShopkeeperOrders", () => {
    it("retorna os pedidos sem parâmetros quando status não é informado", async () => {
      // Arrange
      mockedApi.get.mockResolvedValueOnce({ data: apiOrders });

      // Act
      const result = await getShopkeeperOrders();

      // Assert
      expect(mockedApi.get).toHaveBeenCalledWith("/orders/shopkeeper", {
        params: undefined,
      });
      expect(result).toEqual(apiOrders);
    });

    it("envia o status como parâmetro quando informado", async () => {
      // Arrange
      mockedApi.get.mockResolvedValueOnce({ data: apiOrders });

      // Act
      await getShopkeeperOrders("AWAIT_PAYMENT");

      // Assert
      expect(mockedApi.get).toHaveBeenCalledWith("/orders/shopkeeper", {
        params: { status: "AWAIT_PAYMENT" },
      });
    });

    it("relança o erro HTTP recebido", async () => {
      // Arrange
      const error = createAxiosError(500);
      mockedApi.get.mockRejectedValueOnce(error);

      // Act
      const promise = getShopkeeperOrders();

      // Assert
      await expect(promise).rejects.toBe(error);
    });
  });

  describe("getOrderById", () => {
    it("retorna o detalhe do pedido sem normalização", async () => {
      // Arrange
      mockedApi.get.mockResolvedValueOnce({ data: orderDetail });

      // Act
      const result = await getOrderById("ord-1");

      // Assert
      expect(mockedApi.get).toHaveBeenCalledWith("/orders/ord-1");
      expect(result).toEqual(orderDetail);
    });

    it("relança o erro HTTP recebido", async () => {
      // Arrange
      const error = createAxiosError(500);
      mockedApi.get.mockRejectedValueOnce(error);

      // Act
      const promise = getOrderById("ord-1");

      // Assert
      await expect(promise).rejects.toBe(error);
    });
  });
});