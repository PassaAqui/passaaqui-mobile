import { act, renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren } from "react";
import type { LocationObject } from "expo-location";
import type { RouteMode } from "@/src/services/routeService";
import { useNearbyPois } from "@/src/features/user/map/poi/hooks/useNearbyPois";
import { getPoisNearby } from "@/src/features/user/map/poi/services/poiService";
import type { PoiNearby } from "@/src/features/user/map/poi/services/poiService";
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

interface HookProps {
  location: LocationObject | null;
  mapCenter: { latitude: number; longitude: number } | null;
  mode?: RouteMode;
}

function makePoi(id: number): PoiNearby {
  return {
    id,
    name: `POI ${id}`,
    description: null,
    xpReward: null,
    type: "TOURIST_POINT",
    latitude: -8.0 + id / 10000,
    longitude: -34.9 + id / 10000,
    averageRating: null,
    ratingsCount: null,
    image: null,
    distanceKm: 1,
    distanceLabel: "1.0 km",
  };
}

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
    jest.useRealTimers();
    unmount?.();
    unmount = null;
    client.clear();
  });

  // Usa a API padrão do renderHook (props via initialProps/rerender) em vez de
  // callback: o `rerender(props)` atualiza as props que o hook recebe, então o
  // debounce de 600ms pode ser avançado com `act(() => jest.advanceTimersByTime(600))`.
  function renderWithQuery(props: HookProps) {
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    const rendered = renderHook(
      ({ location, mapCenter, mode }: HookProps) =>
        useNearbyPois(location, mapCenter, mode),
      { wrapper, initialProps: props }
    );
    unmount = rendered.unmount;
    return rendered;
  }

  it("sem location, não busca POIs e retorna listas vazias", () => {
    // Act
    const { result } = renderWithQuery({ location: null, mapCenter: null });

    // Assert
    expect(mockedGetPoisNearby).not.toHaveBeenCalled();
    expect(result.current.touristPois).toEqual([]);
    expect(result.current.shopPois).toEqual([]);
  });

  it("com location, busca POIs e separa por tipo (TOURIST_POINT / STORE)", async () => {
    // Arrange
    mockedGetPoisNearby.mockResolvedValueOnce([poiNearby, storePoi]);

    // Act
    const { result } = renderWithQuery({ location: fakeLocation, mapCenter: null });

    // Assert
    await waitFor(() => expect(result.current.touristPois).toEqual([poiNearby]));
    expect(result.current.shopPois).toEqual([storePoi]);
  });

  it("chama getPoisNearby com modo 'foot-walking' (padrão) e coordenadas de dev", async () => {
    // Arrange
    mockedGetPoisNearby.mockResolvedValueOnce([poiNearby]);

    // Act
    const { result } = renderWithQuery({ location: fakeLocation, mapCenter: null });
    await waitFor(() => expect(result.current.touristPois).toEqual([poiNearby]));

    // Assert
    expect(mockedGetPoisNearby).toHaveBeenCalledWith(-8.0675, -34.9167, "foot-walking");
  });

  it("ao explorar o mapa (mapCenter), o modo padrão vira 'driving-car'", async () => {
    // Arrange
    mockedGetPoisNearby.mockResolvedValueOnce([poiNearby]);

    // Act — arrastar a câmera (mapCenter) faz o padrão de busca ser "driving-car" (raio maior)
    const { result } = renderWithQuery({
      location: fakeLocation,
      mapCenter: { latitude: -8.0600, longitude: -34.8700 },
    });
    await waitFor(() => expect(result.current.touristPois).toEqual([poiNearby]));

    // Assert
    expect(mockedGetPoisNearby).toHaveBeenCalledWith(-8.06, -34.87, "driving-car");
  });

  it("seleção explícita no LocomotionMode prevalece sobre o padrão de exploração", async () => {
    // Arrange
    mockedGetPoisNearby.mockResolvedValueOnce([storePoi]);

    // Act — mesmo explorando o mapa, o modo escolhido pelo usuário ("A pé") é respeitado
    const { result } = renderWithQuery({
      location: fakeLocation,
      mapCenter: { latitude: -8.0600, longitude: -34.8700 },
      mode: "foot-walking",
    });
    await waitFor(() => expect(result.current.shopPois).toEqual([storePoi]));

    // Assert
    expect(mockedGetPoisNearby).toHaveBeenCalledWith(-8.06, -34.87, "foot-walking");
  });

  it("modo selecionado no LocomotionMode é usado como searchMode", async () => {
    // Arrange
    mockedGetPoisNearby.mockResolvedValueOnce([poiNearby]);

    // Act
    const { result } = renderWithQuery({
      location: fakeLocation,
      mapCenter: { latitude: -8.0600, longitude: -34.8700 },
      mode: "driving-car",
    });
    await waitFor(() => expect(result.current.touristPois).toEqual([poiNearby]));

    // Assert
    expect(mockedGetPoisNearby).toHaveBeenCalledWith(-8.06, -34.87, "driving-car");
  });

  it("mudar o modo dispara nova busca para a mesma região (comportamento intencional)", async () => {
    // Arrange
    mockedGetPoisNearby
      .mockResolvedValueOnce([poiNearby])
      .mockResolvedValueOnce([storePoi]);

    const { result, rerender } = renderWithQuery({
      location: fakeLocation,
      mapCenter: { latitude: -8.0600, longitude: -34.8700 },
      mode: "foot-walking",
    });

    // Primeira busca a pé
    await waitFor(() => expect(result.current.touristPois).toEqual([poiNearby]));
    expect(mockedGetPoisNearby).toHaveBeenCalledWith(-8.06, -34.87, "foot-walking");

    // Usuário seleciona "Carro" no LocomotionMode (mesma região, raio maior)
    rerender({
      location: fakeLocation,
      mapCenter: { latitude: -8.0600, longitude: -34.8700 },
      mode: "driving-car",
    });

    // Assert
    await waitFor(() => expect(result.current.shopPois).toEqual([storePoi]));
    expect(mockedGetPoisNearby).toHaveBeenCalledWith(-8.06, -34.87, "driving-car");
    expect(result.current.touristPois).toEqual([poiNearby]);
  });

  it("acumula POIs de diferentes regiões do mapa (não substitui)", async () => {
    // Arrange
    jest.useFakeTimers();
    mockedGetPoisNearby
      .mockResolvedValueOnce([poiNearby])
      .mockResolvedValueOnce([storePoi]);

    const { result, rerender } = renderWithQuery({
      location: fakeLocation,
      mapCenter: { latitude: -8.0600, longitude: -34.8700 },
    });

    // Primeira região
    await waitFor(() => expect(result.current.touristPois).toEqual([poiNearby]));

    // Usuário arrasta a câmera para outra região
    rerender({
      location: fakeLocation,
      mapCenter: { latitude: -8.1000, longitude: -34.9000 },
    });

    // Aguarda o debounce de 600ms para o novo centro valer
    await act(async () => {
      jest.advanceTimersByTime(600);
    });

    // Segunda região — os POIs anteriores não somem
    await waitFor(() => expect(result.current.shopPois).toEqual([storePoi]));
    expect(result.current.touristPois).toEqual([poiNearby]);
  });

  it("limita o acúmulo de POIs, removendo os mais antigos (FIFO)", async () => {
    // Arrange
    jest.useFakeTimers();
    const batch1 = Array.from({ length: 300 }, (_, i) => makePoi(i + 1));
    const batch2 = [makePoi(301), makePoi(302)];
    mockedGetPoisNearby
      .mockResolvedValueOnce(batch1)
      .mockResolvedValueOnce(batch2);

    const { result, rerender } = renderWithQuery({
      location: fakeLocation,
      mapCenter: { latitude: -8.0600, longitude: -34.8700 },
    });

    // Primeira região preenche o limite (300 POIs)
    await waitFor(() => expect(result.current.touristPois).toHaveLength(300));

    // Segunda região adiciona 2 POIs → 302, removendo os 2 mais antigos (ids 1 e 2)
    rerender({
      location: fakeLocation,
      mapCenter: { latitude: -8.1000, longitude: -34.9000 },
    });
    await act(async () => {
      jest.advanceTimersByTime(600);
    });

    // Assert — espera o segundo batch chegar (ids 301/302 presentes) e o limite ser aplicado
    await waitFor(() => {
      const ids = result.current.touristPois.map((p) => p.id);
      expect(ids).toContain(301);
    });
    expect(result.current.touristPois).toHaveLength(300);
    const ids = result.current.touristPois.map((p) => p.id);
    expect(ids).not.toContain(1);
    expect(ids).not.toContain(2);
    expect(ids).toContain(302);
  });
});