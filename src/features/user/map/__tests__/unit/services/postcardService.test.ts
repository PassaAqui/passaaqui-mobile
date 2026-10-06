import { api } from "@/src/services/api/api";
import { getCityData } from "@/src/features/user/map/postcard/services/postcardService";
import {
  cityLocateApiResponse,
  cityResponse,
  createAxiosError,
} from "@/src/features/user/map/__tests__/fixtures/map";

// Mock HTTP: `api` (client central) para a chamada de /city/locate.
jest.mock("@/src/services/api/api", () => ({
  api: {
    post: jest.fn(),
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

describe("postcardService", () => {
  describe("getCityData", () => {
    it("normaliza a resposta da API para CityResponse", async () => {
      // Arrange
      const coords = { latitude: -8.0632, longitude: -34.8711 };
      mockedApi.post.mockResolvedValueOnce({ data: cityLocateApiResponse });

      // Act
      const result = await getCityData(coords.latitude, coords.longitude);

      // Assert
      expect(mockedApi.post).toHaveBeenCalledWith("/city/locate", coords);
      expect(result).toEqual(cityResponse);
    });

    it("retorna null quando a API responde 404 (fora de cidade)", async () => {
      // Arrange
      mockedApi.post.mockRejectedValueOnce(createAxiosError(404));

      // Act
      const result = await getCityData(-8.0632, -34.8711);

      // Assert
      expect(result).toBeNull();
    });

    it("relança outros erros HTTP (ex.: 500)", async () => {
      // Arrange
      mockedApi.post.mockRejectedValueOnce(createAxiosError(500));

      // Act
      const promise = getCityData(-8.0632, -34.8711);

      // Assert
      await expect(promise).rejects.toThrow("Request failed");
    });
  });
});
