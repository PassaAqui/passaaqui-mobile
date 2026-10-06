import { api } from "@/src/services/api/api";
import {
  formatDistance,
  getPoiById,
  getPoisNearby,
} from "@/src/features/user/map/poi/services/poiService";
import {
  poiDetail,
  poiNearby,
  rawPoiDetail,
  rawPoiNearby,
  createAxiosError,
} from "@/src/features/user/map/__tests__/fixtures/map";

// Mock HTTP: `api` (client central) para as chamadas de /pois.
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

describe("poiService", () => {
  describe("formatDistance", () => {
    it("formata distâncias menores que 1 km em metros", () => {
      // Act
      const result = formatDistance(0.5);

      // Assert
      expect(result).toBe("500 m");
    });

    it("formata distâncias de 1 km ou mais com uma casa decimal", () => {
      // Act
      const result = formatDistance(1.24);

      // Assert
      expect(result).toBe("1.2 km");
    });

    it("trata os casos exatos de limite (1 km e quase 1 km)", () => {
      // Act
      const exactlyOne = formatDistance(1);
      const almostOne = formatDistance(0.999);

      // Assert
      expect(exactlyOne).toBe("1.0 km");
      expect(almostOne).toBe("999 m");
    });
  });

  describe("getPoisNearby", () => {
    it("busca POIs e normaliza o payload snake_case", async () => {
      // Arrange
      mockedApi.get.mockResolvedValueOnce({ data: [rawPoiNearby] });

      // Act
      const result = await getPoisNearby(-8.0632, -34.8711, "foot-walking");

      // Assert
      expect(mockedApi.get).toHaveBeenCalledWith("/pois", {
        params: { latitude: -8.0632, longitude: -34.8711, mode: "foot-walking" },
      });
      expect(result).toEqual([poiNearby]);
    });

    it("usa 'driving-car' como modo padrão quando não informado", async () => {
      // Arrange
      mockedApi.get.mockResolvedValueOnce({ data: [] });

      // Act
      await getPoisNearby(-8.0632, -34.8711);

      // Assert
      expect(mockedApi.get).toHaveBeenCalledWith("/pois", {
        params: { latitude: -8.0632, longitude: -34.8711, mode: "driving-car" },
      });
    });
  });

  describe("getPoiById", () => {
    it("busca o POI por id e normaliza os produtos (snake → camel)", async () => {
      // Arrange
      mockedApi.get.mockResolvedValueOnce({ data: rawPoiDetail });

      // Act
      const result = await getPoiById(1);

      // Assert
      expect(mockedApi.get).toHaveBeenCalledWith("/pois/1");
      expect(result).toEqual(poiDetail);
    });

    it("relança o erro HTTP recebido", async () => {
      // Arrange
      const error = createAxiosError(500);
      mockedApi.get.mockRejectedValueOnce(error);

      // Act
      const promise = getPoiById(1);

      // Assert
      await expect(promise).rejects.toBe(error);
    });
  });
});
