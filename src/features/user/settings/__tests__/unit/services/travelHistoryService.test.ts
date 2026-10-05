import { api } from "@/src/services/api/api";
import { getTravelHistory } from "@/src/features/user/settings/services/travelHistoryService";
import {
  travelHistoryRaw,
  travelHistory,
  emptyTravelHistoryRaw,
  createAxiosError,
} from "@/src/features/user/settings/__tests__/fixtures/travelHistory";

jest.mock("@/src/services/api/api", () => ({
  api: {
    get: jest.fn(),
  },
}));

const mockedApi = api as jest.Mocked<typeof api>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("travelHistoryService", () => {
  describe("getTravelHistory", () => {
    it("busca o histórico em /tourists/me/travel-history", async () => {
      // Arrange
      mockedApi.get.mockResolvedValueOnce({ data: travelHistoryRaw });

      // Act
      const result = await getTravelHistory();

      // Assert
      expect(mockedApi.get).toHaveBeenCalledWith("/tourists/me/travel-history");
      expect(result).toEqual(travelHistory);
    });

    it("normaliza as chaves snake_case da API para camelCase", async () => {
      // Arrange
      mockedApi.get.mockResolvedValueOnce({ data: travelHistoryRaw });

      // Act
      const result = await getTravelHistory();

      // Assert
      expect(result[1]).toEqual({
        visitId: 1,
        poiId: 10,
        poiName: "Cristo Redentor",
        poiDescription: "Monumento e ponto turístico histórico",
        imageUrl: "http://localhost:9000/passaaqui-bucket/pois/10.jpg",
        poiType: "TOURIST_POINT",
        cityName: "Rio de Janeiro",
        xpEarned: 50,
        distanceKm: 1.25,
        visitedAt: "2026-05-24T14:30:00",
      });
    });

    it("mantém image_url nulo como null", async () => {
      // Arrange
      mockedApi.get.mockResolvedValueOnce({ data: travelHistoryRaw });

      // Act
      const result = await getTravelHistory();

      // Assert
      expect(result[0].imageUrl).toBeNull();
    });

    it("devolve lista vazia quando a API retorna um array vazio", async () => {
      // Arrange
      mockedApi.get.mockResolvedValueOnce({ data: emptyTravelHistoryRaw });

      // Act
      const result = await getTravelHistory();

      // Assert
      expect(result).toEqual([]);
    });

    it("relança o erro HTTP recebido", async () => {
      // Arrange
      const error = createAxiosError(404);
      mockedApi.get.mockRejectedValueOnce(error);

      // Act
      const promise = getTravelHistory();

      // Assert
      await expect(promise).rejects.toBe(error);
    });
  });
});