import { api } from "@/src/services/api/api";
import { getPurchasedProducts } from "@/src/features/user/purchased/services/purchasedService";
import {
  emptyPurchasedProducts,
  purchasedProducts,
  purchasedProductsRaw,
  createAxiosError,
} from "@/src/features/user/purchased/__tests__/fixtures/purchased";

jest.mock("@/src/services/api/api", () => ({
  api: {
    get: jest.fn(),
  },
}));

const mockedApi = api as jest.Mocked<typeof api>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("purchasedService", () => {
  describe("getPurchasedProducts", () => {
    it("busca os produtos comprados em /orders/purchased-products", async () => {
      // Arrange
      mockedApi.get.mockResolvedValueOnce({ data: purchasedProductsRaw });

      // Act
      const result = await getPurchasedProducts();

      // Assert
      expect(mockedApi.get).toHaveBeenCalledWith("/orders/purchased-products");
      expect(result).toEqual(purchasedProducts);
    });

    it("normaliza as chaves snake_case da API para camelCase", async () => {
      // Arrange
      mockedApi.get.mockResolvedValueOnce({ data: purchasedProductsRaw });

      // Act
      const result = await getPurchasedProducts();

      // Assert
      expect(result.unredeemed[0]).toEqual({
        orderId: "#A3F92",
        productName: "Tapioca Clássica",
        imageUrl: "http://localhost:9000/test-bucket/products/tapioca.jpg",
        status: "UNREDEEMED",
        expirationDate: "2026-04-20",
        redemptionDate: null,
      });
      expect(result.redeemed[0]).toEqual({
        orderId: "#B7C21",
        productName: "Vaso de Cerâmica",
        imageUrl: "http://localhost:9000/test-bucket/products/vaso.jpg",
        status: "REDEEMED",
        expirationDate: null,
        redemptionDate: "2026-04-25",
      });
    });

    it("devolve listas vazias quando a API retorna null", async () => {
      // Arrange
      mockedApi.get.mockResolvedValueOnce({ data: { unredeemed: null, redeemed: null } });

      // Act
      const result = await getPurchasedProducts();

      // Assert
      expect(result).toEqual(emptyPurchasedProducts);
    });

    it("relança o erro HTTP recebido", async () => {
      // Arrange
      const error = createAxiosError(401);
      mockedApi.get.mockRejectedValueOnce(error);

      // Act
      const promise = getPurchasedProducts();

      // Assert
      await expect(promise).rejects.toBe(error);
    });
  });
});
