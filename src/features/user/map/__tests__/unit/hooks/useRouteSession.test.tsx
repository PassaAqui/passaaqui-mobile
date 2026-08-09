import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren } from "react";
import {
  useCurrentRouteSession,
  useDirection,
  useEndRouteSession,
  useStartRouteSession,
  useUpdateRouteLocation,
} from "@/src/features/user/map/hooks/useRouteSession";
import {
  endRouteSession,
  getCurrentRouteSession,
  getDirection,
  startRouteSession,
  updateRouteLocation,
  type RouteMode,
} from "@/src/services/routeService";
import {
  routeSession,
  createAxiosError,
} from "@/src/features/user/map/__tests__/fixtures/map";

jest.mock("@/src/services/routeService", () => ({
  startRouteSession: jest.fn(),
  getCurrentRouteSession: jest.fn(),
  endRouteSession: jest.fn(),
  getDirection: jest.fn(),
  updateRouteLocation: jest.fn(),
}));

const mockedStartRouteSession = startRouteSession as jest.MockedFunction<typeof startRouteSession>;
const mockedGetCurrentRouteSession =
  getCurrentRouteSession as jest.MockedFunction<typeof getCurrentRouteSession>;
const mockedEndRouteSession = endRouteSession as jest.MockedFunction<typeof endRouteSession>;
const mockedGetDirection = getDirection as jest.MockedFunction<typeof getDirection>;
const mockedUpdateRouteLocation =
  updateRouteLocation as jest.MockedFunction<typeof updateRouteLocation>;

describe("useRouteSession", () => {
  let client: QueryClient;
  let unmount: (() => void) | null = null;

  beforeEach(() => {
    jest.clearAllMocks();
    client = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
        // Sem gcTime: 0, a mutation agenda um setTimeout de GC (padrão 5 min) ao
        // desmontar o observer, mantendo o Jest vivo ("did not exit gracefully").
        mutations: { gcTime: 0 },
      },
    });
  });

  afterEach(() => {
    unmount?.();
    unmount = null;
    client.clear();
  });

  function renderWithQuery<T>(useHook: () => T) {
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    const rendered = renderHook(useHook, { wrapper });
    unmount = rendered.unmount;
    return rendered;
  }

  describe("useCurrentRouteSession", () => {
    it("inicia com isPending (query desabilitada)", () => {
      // Act
      const { result } = renderWithQuery(() => useCurrentRouteSession());

      // Assert
      expect(result.current.isPending).toBe(true);
    });

    it("preenche data após refetch em caso de sucesso", async () => {
      // Arrange
      mockedGetCurrentRouteSession.mockResolvedValueOnce(routeSession);

      // Act
      const { result } = renderWithQuery(() => useCurrentRouteSession());
      // Nota: assert no valor resolvido do refetch (consumido pelo useNavigation);
      // o notifyManager agenda o notify com setTimeout(0), que a RNTL/React 19
      // não aplica em result.current fora do act.
      const refetched = await result.current.refetch();

      // Assert
      expect(mockedGetCurrentRouteSession).toHaveBeenCalled();
      expect(refetched.isSuccess).toBe(true);
      expect(refetched.data).toEqual(routeSession);
    });

    it("expõe error quando o refetch falha", async () => {
      // Arrange
      const error = createAxiosError(500);
      mockedGetCurrentRouteSession.mockRejectedValueOnce(error);

      // Act
      const { result } = renderWithQuery(() => useCurrentRouteSession());
      const refetched = await result.current.refetch();

      // Assert
      expect(refetched.isError).toBe(true);
      expect(refetched.error).toBe(error);
    });
  });

  describe("useStartRouteSession", () => {
    it("grava a sessão retornada no cache após sucesso", async () => {
      // Arrange
      mockedStartRouteSession.mockResolvedValueOnce(routeSession);
      const payload = { latitude: -8.0632, longitude: -34.8711, poiId: 1 };

      // Act
      const { result } = renderWithQuery(() => useStartRouteSession());
      await result.current.mutateAsync(payload);

      // Assert
      expect(mockedStartRouteSession).toHaveBeenCalledWith(payload, expect.anything());
      expect(client.getQueryData(["route-session"])).toEqual(routeSession);
    });

    it("expõe error quando a mutation rejeita", async () => {
      // Arrange
      const error = createAxiosError(500);
      mockedStartRouteSession.mockRejectedValueOnce(error);

      // Act
      const { result } = renderWithQuery(() => useStartRouteSession());
      await expect(result.current.mutateAsync({})).rejects.toBe(error);

      // Assert
      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBe(error);
    });
  });

  describe("useDirection", () => {
    const directionVariables = {
      mode: "foot-walking" as RouteMode,
      startLatitude: -8.0632,
      startLongitude: -34.8711,
      endLatitude: -8.0611,
      endLongitude: -34.8698,
      poiId: 1,
    };

    it("grava sessão ACTIVE com destination montada a partir das variáveis", async () => {
      // Arrange
      mockedGetDirection.mockResolvedValueOnce({
        coordinates: [{ latitude: -8.0632, longitude: -34.8711 }],
        distance: "1.9",
        duration: 8,
      });

      // Act
      const { result } = renderWithQuery(() => useDirection());
      await result.current.mutateAsync(directionVariables);

      // Assert
      expect(client.getQueryData(["route-session"])).toEqual({
        status: "ACTIVE",
        destination: {
          startLatitude: -8.0632,
          startLongitude: -34.8711,
          stopLatitude: -8.0611,
          stopLongitude: -34.8698,
          mode: "foot-walking",
          poiId: 1,
        },
        lastLocation: null,
      });
    });

    it("preserva o lastLocation já existente no cache", async () => {
      // Arrange
      mockedGetDirection.mockResolvedValueOnce({
        coordinates: [],
        distance: "1.9",
        duration: 8,
      });
      client.setQueryData(["route-session"], routeSession);

      // Act
      const { result } = renderWithQuery(() => useDirection());
      await result.current.mutateAsync(directionVariables);

      // Assert
      expect(client.getQueryData(["route-session"])).toEqual({
        status: "ACTIVE",
        destination: {
          startLatitude: -8.0632,
          startLongitude: -34.8711,
          stopLatitude: -8.0611,
          stopLongitude: -34.8698,
          mode: "foot-walking",
          poiId: 1,
        },
        lastLocation: routeSession.lastLocation,
      });
    });

    it("expõe error quando a mutation rejeita", async () => {
      // Arrange
      const error = createAxiosError(500);
      mockedGetDirection.mockRejectedValueOnce(error);

      // Act
      const { result } = renderWithQuery(() => useDirection());
      await expect(result.current.mutateAsync(directionVariables)).rejects.toBe(error);

      // Assert
      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBe(error);
    });
  });

  describe("useUpdateRouteLocation", () => {
    it("atualiza lastLocation no cache quando há sessão", async () => {
      // Arrange
      mockedUpdateRouteLocation.mockResolvedValueOnce(undefined);
      client.setQueryData(["route-session"], routeSession);
      const coords = { latitude: -8.05, longitude: -34.87 };

      // Act
      const { result } = renderWithQuery(() => useUpdateRouteLocation());
      await result.current.mutateAsync(coords);

      // Assert
      expect(mockedUpdateRouteLocation).toHaveBeenCalledWith(coords, expect.anything());
      expect(client.getQueryData(["route-session"])).toEqual({
        ...routeSession,
        lastLocation: coords,
      });
    });

    it("mantém o cache undefined quando não há sessão (não lança)", async () => {
      // Arrange
      mockedUpdateRouteLocation.mockResolvedValueOnce(undefined);

      // Act
      const { result } = renderWithQuery(() => useUpdateRouteLocation());
      await expect(
        result.current.mutateAsync({ latitude: -8.05, longitude: -34.87 })
      ).resolves.toBeUndefined();

      // Assert
      expect(client.getQueryData(["route-session"])).toBeUndefined();
    });

    it("expõe error quando a mutation rejeita", async () => {
      // Arrange
      const error = createAxiosError(500);
      mockedUpdateRouteLocation.mockRejectedValueOnce(error);

      // Act
      const { result } = renderWithQuery(() => useUpdateRouteLocation());
      await expect(
        result.current.mutateAsync({ latitude: -8.05, longitude: -34.87 })
      ).rejects.toBe(error);

      // Assert
      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBe(error);
    });
  });

  describe("useEndRouteSession", () => {
    it("remove a sessão do cache após sucesso", async () => {
      // Arrange
      mockedEndRouteSession.mockResolvedValueOnce(undefined);
      client.setQueryData(["route-session"], routeSession);

      // Act
      const { result } = renderWithQuery(() => useEndRouteSession());
      await result.current.mutateAsync();

      // Assert
      expect(mockedEndRouteSession).toHaveBeenCalled();
      expect(client.getQueryData(["route-session"])).toBeUndefined();
    });

    it("expõe error quando a mutation rejeita", async () => {
      // Arrange
      const error = createAxiosError(500);
      mockedEndRouteSession.mockRejectedValueOnce(error);

      // Act
      const { result } = renderWithQuery(() => useEndRouteSession());
      await expect(result.current.mutateAsync()).rejects.toBe(error);

      // Assert
      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBe(error);
    });
  });
});
