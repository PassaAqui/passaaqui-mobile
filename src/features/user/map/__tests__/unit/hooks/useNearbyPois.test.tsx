import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren } from "react";
import type { LocationObject } from "expo-location";
import { useNearbyPois } from "@/src/features/user/map/poi/hooks/useNearbyPois";
import { getPoisNearby } from "@/src/features/user/map/poi/services/poiService";
import {
  poiNearby,
  storePoi,
} from "@/src/features/user/map/__tests__/fixtures/map";

jest.mock("@/src/features/user/map/poi/services/poiService", () => ({
  getPoisNearby: jest.fn(),
}));

const mockedGetPoisNearby = getPoisNearby as jest.MockedFunction<typeof getPoisNearby>;

// O hook só usa o objeto para decidir `enabled` (`!!location`); as coordenadas
// efetivas da chamada são fixas em dev (-8.0675 / -34.9167).
const fakeLocation = {
  coords: { latitude: -8.0675, longitude: -34.9167 },
} as LocationObject;

describe("useNearbyPois", () => {
  let client: QueryClient;
  let unmount: (() => void) | null = null;

  beforeEach(() => {
    jest.clearAllMocks();
    client = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
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

  it("sem location, não busca POIs e retorna listas vazias", () => {
    // Act
    const { result } = renderWithQuery(() => useNearbyPois(null));

    // Assert
    expect(mockedGetPoisNearby).not.toHaveBeenCalled();
    expect(result.current.touristPois).toEqual([]);
    expect(result.current.shopPois).toEqual([]);
  });

  it("com location, busca POIs e separa por tipo (TOURIST_POINT / STORE)", async () => {
    // Arrange
    mockedGetPoisNearby.mockResolvedValueOnce([poiNearby, storePoi]);

    // Act
    const { result } = renderWithQuery(() => useNearbyPois(fakeLocation));

    // Assert
    await waitFor(() => expect(result.current.touristPois).toEqual([poiNearby]));
    expect(result.current.shopPois).toEqual([storePoi]);
  });

  it("chama getPoisNearby com modo 'foot-walking' e coordenadas de dev", async () => {
    // Arrange
    mockedGetPoisNearby.mockResolvedValueOnce([poiNearby]);

    // Act
    const { result } = renderWithQuery(() => useNearbyPois(fakeLocation));
    await waitFor(() => expect(result.current.touristPois).toEqual([poiNearby]));

    // Assert
    expect(mockedGetPoisNearby).toHaveBeenCalledWith(-8.0675, -34.9167, "foot-walking");
  });
});
