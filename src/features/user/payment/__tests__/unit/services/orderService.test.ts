import { api } from "@/src/services/api/api";
import {
  checkoutOrder,
  getOrder,
} from "@/src/features/user/payment/services/orderService";
import {
  order,
  createAxiosError,
} from "@/src/features/user/payment/__tests__/fixtures/payment";

// Mock HTTP: `api` (client central) para as chamadas de /orders.
jest.mock("@/src/services/api/api", () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const mockedApi = api as jest.Mocked<typeof api>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("orderService", () => {
  describe("checkoutOrder", () => {
    it("cria o pedido e retorna o payload como veio da API", async () => {
      // Arrange
      mockedApi.post.mockResolvedValueOnce({ data: order });

      // Act
      const result = await checkoutOrder(1);

      // Assert
      expect(mockedApi.post).toHaveBeenCalledWith("/orders/checkout", {
        productId: 1,
      });
      expect(result).toEqual(order);
    });

    it("relança o erro HTTP recebido", async () => {
      // Arrange
      const error = createAxiosError(500);
      mockedApi.post.mockRejectedValueOnce(error);

      // Act
      const promise = checkoutOrder(1);

      // Assert
      await expect(promise).rejects.toBe(error);
    });
  });

  describe("getOrder", () => {
    it("busca o pedido por id e retorna o payload como veio da API", async () => {
      // Arrange
      mockedApi.get.mockResolvedValueOnce({ data: order });

      // Act
      const result = await getOrder("ord-1");

      // Assert
      expect(mockedApi.get).toHaveBeenCalledWith("/orders/ord-1");
      expect(result).toEqual(order);
    });

    it("relança o erro HTTP recebido", async () => {
      // Arrange
      const error = createAxiosError(500);
      mockedApi.get.mockRejectedValueOnce(error);

      // Act
      const promise = getOrder("ord-1");

      // Assert
      await expect(promise).rejects.toBe(error);
    });
  });
});