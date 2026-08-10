import { api } from "@/src/services/api/api";
import {
  getAllCategories,
  getCategoryById,
} from "@/src/features/category/services/categoryService";
import {
  categories,
  rawCategoryProducts,
  categoryProductsWithImages,
  createAxiosError,
} from "@/src/features/category/__tests__/fixtures/category";

// Mock HTTP: `api` (client central) para as chamadas de /categories.
jest.mock("@/src/services/api/api", () => ({
  api: {
    get: jest.fn(),
  },
}));

const mockedApi = api as jest.Mocked<typeof api>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("categoryService", () => {
  describe("getAllCategories", () => {
    it("retorna a lista de categorias sem normalização", async () => {
      // Arrange
      mockedApi.get.mockResolvedValueOnce({ data: categories });

      // Act
      const result = await getAllCategories();

      // Assert
      expect(mockedApi.get).toHaveBeenCalledWith("/categories");
      expect(result).toEqual(categories);
    });

    it("relança o erro HTTP recebido", async () => {
      // Arrange
      const error = createAxiosError(500);
      mockedApi.get.mockRejectedValueOnce(error);

      // Act
      const promise = getAllCategories();

      // Assert
      await expect(promise).rejects.toBe(error);
    });
  });

  describe("getCategoryById", () => {
    it("normaliza image para images: [image] nos produtos do content", async () => {
      // Arrange
      mockedApi.get.mockResolvedValueOnce({ data: rawCategoryProducts });

      // Act
      const result = await getCategoryById(3);

      // Assert
      expect(mockedApi.get).toHaveBeenCalledWith("/categories/3", {
        params: { page: 0, size: 20 },
      });
      expect(result).toEqual(categoryProductsWithImages);
    });

    it("produto sem image vira images: [] preservando o restante", async () => {
      // Arrange
      mockedApi.get.mockResolvedValueOnce({ data: rawCategoryProducts });

      // Act
      const result = await getCategoryById(3);

      // Assert
      const product = result.products.content.find((p) => p.id === 3);
      expect(product).toEqual(categoryProductsWithImages.products.content[1]);
    });

    it("usa params default page 0 e size 20 quando só o id é informado", async () => {
      // Arrange
      mockedApi.get.mockResolvedValueOnce({ data: rawCategoryProducts });

      // Act
      await getCategoryById(3);

      // Assert
      expect(mockedApi.get).toHaveBeenCalledWith("/categories/3", {
        params: { page: 0, size: 20 },
      });
    });

    it("usa params custom page e size", async () => {
      // Arrange
      mockedApi.get.mockResolvedValueOnce({ data: rawCategoryProducts });

      // Act
      await getCategoryById(3, 2, 5);

      // Assert
      expect(mockedApi.get).toHaveBeenCalledWith("/categories/3", {
        params: { page: 2, size: 5 },
      });
    });

    it("preserva os metadados de paginação e as chaves da categoria", async () => {
      // Arrange
      mockedApi.get.mockResolvedValueOnce({ data: rawCategoryProducts });

      // Act
      const result = await getCategoryById(3);

      // Assert
      expect(result.id).toBe(3);
      expect(result.name).toBe("Café");
      expect(result.description).toBe("Cafés especiais");
      expect(result.products.totalElements).toBe(2);
      expect(result.products.totalPages).toBe(1);
      expect(result.products.number).toBe(0);
      expect(result.products.size).toBe(20);
      expect(result.products.first).toBe(true);
      expect(result.products.last).toBe(true);
    });

    it("relança o erro HTTP recebido", async () => {
      // Arrange
      const error = createAxiosError(500);
      mockedApi.get.mockRejectedValueOnce(error);

      // Act
      const promise = getCategoryById(3);

      // Assert
      await expect(promise).rejects.toBe(error);
    });
  });
});