import { api } from "@/src/services/api/api";
import {
  getTouristMe,
  TouristProfile,
} from "@/src/features/user/auth/services/touristService";
import { createAxiosError } from "@/src/features/user/auth/__tests__/fixtures/auth";

// Mock HTTP: `api` (client central) para a chamada via `api.get`.
jest.mock("@/src/services/api/api", () => ({
  api: {
    get: jest.fn(),
  },
}));

const mockedApi = api as jest.Mocked<typeof api>;

const validTouristProfile: TouristProfile = {
  id: 1,
  name: "Turista Teste",
  currentXP: 120,
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, "log").mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("touristService", () => {
  describe("getTouristMe", () => {
    it("retorna o perfil do turista autenticado", async () => {
      // Arrange
      mockedApi.get.mockResolvedValueOnce({ data: validTouristProfile });

      // Act
      const profile = await getTouristMe();

      // Assert
      expect(mockedApi.get).toHaveBeenCalledWith("/tourists/me");
      expect(profile).toEqual(validTouristProfile);
    });

    it("relança o erro quando a requisição falha", async () => {
      // Arrange
      const error = createAxiosError(500);
      mockedApi.get.mockRejectedValueOnce(error);

      // Act
      const result = getTouristMe();

      // Assert
      await expect(result).rejects.toBe(error);
      expect(mockedApi.get).toHaveBeenCalledWith("/tourists/me");
    });

    it("relança o erro quando a requisição falha com 401 (sessão inválida)", async () => {
      // Arrange
      const error = createAxiosError(401);
      mockedApi.get.mockRejectedValueOnce(error);

      // Act
      const result = getTouristMe();

      // Assert
      await expect(result).rejects.toBe(error);
    });
  });
});