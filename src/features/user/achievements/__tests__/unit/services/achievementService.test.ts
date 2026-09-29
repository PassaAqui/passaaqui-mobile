import { api } from "@/src/services/api/api";
import { getAchievements } from "@/src/features/user/achievements/services/achievementService";
import {
  achievements,
  achievementsRaw,
  createAxiosError,
} from "@/src/features/user/achievements/__tests__/fixtures/achievement";

jest.mock("@/src/services/api/api", () => ({
  api: {
    get: jest.fn(),
  },
}));

const mockedApi = api as jest.Mocked<typeof api>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("achievementService", () => {
  describe("getAchievements", () => {
    it("busca as conquistas em /achievements", async () => {
      // Arrange
      mockedApi.get.mockResolvedValueOnce({ data: achievementsRaw });

      // Act
      const result = await getAchievements();

      // Assert
      expect(mockedApi.get).toHaveBeenCalledWith("/achievements");
      expect(result).toEqual(achievements);
    });

    it("normaliza as chaves snake_case da API para camelCase", async () => {
      // Arrange
      mockedApi.get.mockResolvedValueOnce({ data: achievementsRaw });

      // Act
      const result = await getAchievements();

      // Assert
      expect(result[0]).toEqual({
        achievementId: 1,
        name: "Rio Timbó",
        description:
          "Uma iguaria digna da realeza, feita com a goma mais pura de Pernambuco e recheio de tradição.",
        photoUrl: "http://localhost:9000/test-bucket/achievements/rio-timbo.jpg",
        xpReward: 100,
        categoryId: 2,
        categoryName: "Cultura",
        location: "Mercado São José",
        poiId: 5,
        poiName: "Mercado São José",
        unlocked: true,
        unlockedAt: "2026-01-01T10:00:00",
      });
    });

    it("mantém os campos nulos de uma conquista bloqueada como null", async () => {
      // Arrange
      mockedApi.get.mockResolvedValueOnce({ data: achievementsRaw });

      // Act
      const result = await getAchievements();

      // Assert
      expect(result[1]).toEqual({
        achievementId: 2,
        name: "Tapioca real",
        description: "Colete para colar",
        photoUrl: "http://localhost:9000/test-bucket/achievements/tapioca.jpg",
        xpReward: 50,
        categoryId: 1,
        categoryName: "Gastronomia",
        location: null,
        poiId: null,
        poiName: null,
        unlocked: false,
        unlockedAt: null,
      });
    });

    it("propaga o erro quando a requisição falha", async () => {
      // Arrange
      const error = createAxiosError(500);
      mockedApi.get.mockRejectedValueOnce(error);

      // Act / Assert
      await expect(getAchievements()).rejects.toBe(error);
    });
  });
});
