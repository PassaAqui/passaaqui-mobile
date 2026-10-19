import { api } from "@/src/services/api/api";
import {
  endRouteSession,
  getCurrentRouteSession,
  getDirection,
  checkinAtPoi,
  startRouteSession,
  updateRouteLocation,
} from "@/src/services/routeService";
import {
  checkinApiResponse,
  checkinResult,
  directionResponse,
  routeSession,
} from "@/src/features/user/map/__tests__/fixtures/map";

// Mock HTTP: `api` (client central) para as chamadas de /route e /direction.
jest.mock("@/src/services/api/api", () => ({
  api: {
    post: jest.fn(),
    get: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedApi = api as jest.Mocked<typeof api>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("routeService", () => {
  describe("getDirection", () => {
    it("inverte [lng, lat] para latitude/longitude e retorna distância e duração", async () => {
      // Arrange
      mockedApi.post.mockResolvedValueOnce({ data: directionResponse });

      // Act
      const result = await getDirection({
        mode: "foot-walking",
        startLatitude: -8.0632,
        startLongitude: -34.8711,
        endLatitude: -8.0611,
        endLongitude: -34.8698,
      });

      // Assert
      expect(mockedApi.post).toHaveBeenCalledWith("/direction", {
        mode: "foot-walking",
        startLatitude: -8.0632,
        startLongitude: -34.8711,
        endLatitude: -8.0611,
        endLongitude: -34.8698,
      });
      expect(result.coordinates).toEqual([
        { latitude: -8.0632, longitude: -34.8711 },
        { latitude: -8.0611, longitude: -34.8698 },
      ]);
      expect(result.distance).toBe("1.9");
      expect(result.duration).toBe(8);
    });

    it("lança erro quando o GeoJSON não tem features", async () => {
      // Arrange
      mockedApi.post.mockResolvedValueOnce({ data: { features: [] } });

      // Act
      const promise = getDirection({
        mode: "driving-car",
        startLatitude: -8.0632,
        startLongitude: -34.8711,
        endLatitude: -8.0611,
        endLongitude: -34.8698,
      });

      // Assert
      await expect(promise).rejects.toThrow(
        "[getDirection ERROR]: Nenhuma rota encontrada."
      );
    });
  });

  describe("startRouteSession", () => {
    it("inicia a sessão de rota com o payload recebido e retorna a sessão", async () => {
      // Arrange
      const payload = { latitude: -8.0632, longitude: -34.8711, poiId: 1 };
      mockedApi.post.mockResolvedValueOnce({ data: routeSession });

      // Act
      const result = await startRouteSession(payload);

      // Assert
      expect(mockedApi.post).toHaveBeenCalledWith("/route/start", payload);
      expect(result).toEqual(routeSession);
    });

    it("inicia a sessão sem payload enviando objeto vazio", async () => {
      // Arrange
      mockedApi.post.mockResolvedValueOnce({ data: routeSession });

      // Act
      const result = await startRouteSession();

      // Assert
      expect(mockedApi.post).toHaveBeenCalledWith("/route/start", {});
      expect(result).toEqual(routeSession);
    });
  });

  describe("getCurrentRouteSession", () => {
    it("busca a sessão atual em /route/current", async () => {
      // Arrange
      mockedApi.get.mockResolvedValueOnce({ data: routeSession });

      // Act
      const result = await getCurrentRouteSession();

      // Assert
      expect(mockedApi.get).toHaveBeenCalledWith("/route/current");
      expect(result).toEqual(routeSession);
    });
  });

  describe("endRouteSession", () => {
    it("encerra a sessão atual com DELETE em /route/current", async () => {
      // Arrange
      mockedApi.delete.mockResolvedValueOnce({ data: undefined });

      // Act
      await endRouteSession();

      // Assert
      expect(mockedApi.delete).toHaveBeenCalledWith("/route/current");
    });
  });

  describe("updateRouteLocation", () => {
    it("envia a localização atual para /route/location", async () => {
      // Arrange
      const coords = { latitude: -8.0608, longitude: -34.8699 };
      mockedApi.post.mockResolvedValueOnce({ data: undefined });

      // Act
      await updateRouteLocation(coords);

      // Assert
      expect(mockedApi.post).toHaveBeenCalledWith("/route/location", coords);
    });
  });

  describe("checkinAtPoi", () => {
    it("envia a distância e normaliza o payload do backend para o contrato do app", async () => {
      // Arrange
      mockedApi.post.mockResolvedValueOnce({ data: checkinApiResponse });

      // Act
      const result = await checkinAtPoi(1, 1.2);

      // Assert
      expect(mockedApi.post).toHaveBeenCalledWith("/pois/1/checkin", { distanceKm: 1.2 });
      expect(result).toEqual(checkinResult);
    });

    it("normaliza cálculo nulo mantendo XP e motivo de bloqueio", async () => {
      // Arrange
      mockedApi.post.mockResolvedValueOnce({
        data: {
          xp_granted: 0,
          calculation: null,
          applied_rules: { anti_farming_active: true, invalid_gps: false },
          block_reason: "Cooldown active",
        },
      });

      // Act
      const result = await checkinAtPoi(2);

      // Assert
      expect(result).toEqual({
        xp_concedido: 0,
        calculo: null,
        regras_aplicadas: { anti_farming_ativo: true, gps_invalido: false },
        motivo_bloqueio: "Cooldown active",
      });
    });
  });
});
