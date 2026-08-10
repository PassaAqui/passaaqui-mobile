import { api } from "@/src/services/api/api";
import {
  getAllProducts,
  getProductById,
} from "@/src/features/user/shop/services/productService";
import {
  productDetail,
  products,
  createAxiosError,
} from "@/src/features/user/shop/__tests__/fixtures/shop";

// Mock HTTP: `api` (client central) para as chamadas de /products.
jest.mock("@/src/services/api/api", () => ({
  api: {
    get: jest.fn(),
  },
}));

const mockedApi = api as jest.Mocked<typeof api>;

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, "log").mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("productService", () => {
  describe("getProductById", () => {
    it("busca o produto por id e retorna o payload como veio da API", async () => {
      // Arrange
      mockedApi.get.mockResolvedValueOnce({ data: productDetail });

      // Act
      const result = await getProductById(5);

      // Assert
      expect(mockedApi.get).toHaveBeenCalledWith("/products/5");
      expect(result).toEqual(productDetail);
    });

    it("relança o erro HTTP recebido", async () => {
      // Arrange
      const error = createAxiosError(500);
      mockedApi.get.mockRejectedValueOnce(error);

      // Act
      const promise = getProductById(5);

      // Assert
      await expect(promise).rejects.toBe(error);
    });
  });

  describe("getAllProducts", () => {
    it("retorna a lista de produtos", async () => {
      // Arrange
      mockedApi.get.mockResolvedValueOnce({ data: products });

      // Act
      const result = await getAllProducts();

      // Assert
      expect(mockedApi.get).toHaveBeenCalledWith("/products");
      expect(result).toEqual(products);
    });

    it("relança o erro HTTP recebido", async () => {
      // Arrange
      const error = createAxiosError(500);
      mockedApi.get.mockRejectedValueOnce(error);

      // Act
      const promise = getAllProducts();

      // Assert
      await expect(promise).rejects.toBe(error);
    });
  });
});
