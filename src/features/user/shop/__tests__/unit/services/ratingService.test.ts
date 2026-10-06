import { api } from "@/src/services/api/api";
import { getProductRatings } from "@/src/features/user/shop/services/ratingService";
import {
  productRating,
  productRatingMinimal,
  createAxiosError,
} from "@/src/features/user/shop/__tests__/fixtures/productRatings";

jest.mock("@/src/services/api/api", () => ({
  api: {
    get: jest.fn(),
  },
}));

const mockedApi = api as jest.Mocked<typeof api>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("ratingService", () => {
  describe("getProductRatings", () => {
    it("busca as avaliações em /products/{id}/ratings", async () => {
      // Arrange
      mockedApi.get.mockResolvedValueOnce({ data: [productRating] });

      // Act
      const result = await getProductRatings(10);

      // Assert
      expect(mockedApi.get).toHaveBeenCalledWith("/products/10/ratings");
      expect(result).toEqual([productRating]);
    });

    it("devolve a avaliação sem comentário e sem mídias como veio da API", async () => {
      // Arrange
      mockedApi.get.mockResolvedValueOnce({ data: [productRatingMinimal] });

      // Act
      const result = await getProductRatings(10);

      // Assert
      expect(result[0].comment).toBeNull();
      expect(result[0].photos).toEqual([]);
      expect(result[0].video).toBeNull();
    });

    it("devolve lista vazia quando a API retorna null", async () => {
      // Arrange
      mockedApi.get.mockResolvedValueOnce({ data: null });

      // Act
      const result = await getProductRatings(10);

      // Assert
      expect(result).toEqual([]);
    });

    it("relança o erro HTTP recebido", async () => {
      // Arrange
      const error = createAxiosError(404);
      mockedApi.get.mockRejectedValueOnce(error);

      // Act
      const promise = getProductRatings(10);

      // Assert
      await expect(promise).rejects.toBe(error);
    });
  });
});