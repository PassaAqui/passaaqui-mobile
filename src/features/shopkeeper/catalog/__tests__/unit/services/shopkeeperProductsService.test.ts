import { api } from "@/src/services/api/api";
import {
  getShopkeeperProducts,
  getShopkeeperProductMetrics,
} from "@/src/features/shopkeeper/catalog/services/shopkeeperProductsService";
import {
  metrics,
  shopkeeperProducts,
} from "@/src/features/shopkeeper/catalog/__tests__/fixtures/catalog";
import { createAxiosError } from "@/src/features/shopkeeper/auth/__tests__/fixtures/shopkeeper";

// Mock HTTP: `api` (client central) para as chamadas de /products/shopkeeper.
jest.mock("@/src/services/api/api", () => ({
  api: {
    get: jest.fn(),
  },
}));

const mockedApi = api as jest.Mocked<typeof api>;

describe("shopkeeperProductsService", () => {
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  describe("getShopkeeperProducts", () => {
    it("retorna os produtos do lojista sem inStock", async () => {
      // Arrange
      mockedApi.get.mockResolvedValueOnce({ data: shopkeeperProducts });

      // Act
      const result = await getShopkeeperProducts();

      // Assert
      expect(mockedApi.get).toHaveBeenCalledWith("/products/shopkeeper", {
        params: { inStock: undefined },
      });
      expect(result).toEqual(shopkeeperProducts);
    });

    it("passa inStock true nos params da chamada", async () => {
      // Arrange
      mockedApi.get.mockResolvedValueOnce({ data: shopkeeperProducts });

      // Act
      await getShopkeeperProducts({ inStock: true });

      // Assert
      expect(mockedApi.get).toHaveBeenCalledWith("/products/shopkeeper", {
        params: { inStock: true },
      });
    });

    it("relança o erro HTTP recebido", async () => {
      // Arrange
      const error = createAxiosError(500);
      mockedApi.get.mockRejectedValueOnce(error);

      // Act
      const promise = getShopkeeperProducts();

      // Assert
      await expect(promise).rejects.toBe(error);
    });
  });

  describe("getShopkeeperProductMetrics", () => {
    it("retorna as métricas snake_case sem normalização", async () => {
      // Arrange
      mockedApi.get.mockResolvedValueOnce({ data: metrics });

      // Act
      const result = await getShopkeeperProductMetrics();

      // Assert
      expect(mockedApi.get).toHaveBeenCalledWith(
        "/products/shopkeeper/metrics"
      );
      expect(result).toEqual(metrics);
    });

    it("relança o erro HTTP recebido", async () => {
      // Arrange
      const error = createAxiosError(500);
      mockedApi.get.mockRejectedValueOnce(error);

      // Act
      const promise = getShopkeeperProductMetrics();

      // Assert
      await expect(promise).rejects.toBe(error);
    });
  });
});