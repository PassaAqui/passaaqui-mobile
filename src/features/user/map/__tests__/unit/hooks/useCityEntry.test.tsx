import { act, renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren } from "react";
import type { LocationObject } from "expo-location";
import { useCityEntry } from "@/src/features/user/map/hooks/useCityEntry";
import { getCityData } from "@/src/features/user/map/postcard/services/postcardService";
import { useVisitedCitiesStore } from "@/src/stores/user/map/visitedCitiesStore";
import { cityResponse } from "@/src/features/user/map/__tests__/fixtures/map";

// Mock do AsyncStorage (o persist do visitedCitiesStore depende dele e o
// jest.setup.ts não cobre AsyncStorage — mesma decisão de visitedCitiesStore.test.ts).
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

jest.mock("@/src/features/user/map/postcard/services/postcardService", () => ({
  getCityData: jest.fn(),
}));

const mockedGetCityData = getCityData as jest.MockedFunction<typeof getCityData>;

// Coordenadas fixas de dev (-8.0675 / -34.9167) arredondadas com roundCoord
// (Math.round(v * 1000) / 1000): -8.068 / -34.917 → query key ["city-locate", ...].
const cityQueryKey = ["city-locate", -8.068, -34.917];

// O hook só usa o objeto para decidir `enabled` (`!!location`).
const fakeLocation = {
  coords: { latitude: -8.0675, longitude: -34.9167 },
} as LocationObject;

describe("useCityEntry", () => {
  let client: QueryClient;
  let unmount: (() => void) | null = null;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
    useVisitedCitiesStore.setState({ visitedCityIds: [] });
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
    jest.restoreAllMocks();
  });

  function renderWithQuery<T>(useHook: () => T) {
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    const rendered = renderHook(useHook, { wrapper });
    unmount = rendered.unmount;
    return rendered;
  }

  it("sem location, não busca cidade e loadingCity fica false", () => {
    // Act
    const { result } = renderWithQuery(() => useCityEntry(null));

    // Assert
    expect(mockedGetCityData).not.toHaveBeenCalled();
    expect(result.current.loadingCity).toBe(false);
    expect(result.current.cityToShow).toBeNull();
  });

  it("em cidade nova, marca como visitada e preenche cityToShow", async () => {
    // Arrange
    mockedGetCityData.mockResolvedValueOnce(cityResponse);

    // Act
    const { result } = renderWithQuery(() => useCityEntry(fakeLocation));
    await waitFor(() => expect(result.current.cityToShow).toEqual(cityResponse));

    // Assert
    expect(useVisitedCitiesStore.getState().visitedCityIds).toEqual([cityResponse.cityId]);
    expect(mockedGetCityData).toHaveBeenCalledWith(-8.0675, -34.9167);
  });

  it("em cidade já visitada, não marca nem mostra o postcard", async () => {
    // Arrange
    useVisitedCitiesStore.setState({ visitedCityIds: [cityResponse.cityId] });
    mockedGetCityData.mockResolvedValueOnce(cityResponse);

    // Act
    const { result } = renderWithQuery(() => useCityEntry(fakeLocation));
    await waitFor(() =>
      expect(client.getQueryState(cityQueryKey)?.status).toBe("success")
    );

    // Assert
    expect(useVisitedCitiesStore.getState().visitedCityIds).toEqual([cityResponse.cityId]);
    expect(result.current.cityToShow).toBeNull();
  });

  it("dismissCity limpa cityToShow", async () => {
    // Arrange
    mockedGetCityData.mockResolvedValueOnce(cityResponse);

    // Act
    const { result } = renderWithQuery(() => useCityEntry(fakeLocation));
    await waitFor(() => expect(result.current.cityToShow).toEqual(cityResponse));
    act(() => result.current.dismissCity());

    // Assert
    expect(result.current.cityToShow).toBeNull();
  });

  it("expõe erro na query via cache (hook não retorna isError)", async () => {
    // Arrange
    const error = new Error("falha na rede");
    mockedGetCityData.mockRejectedValueOnce(error);

    // Act
    const { result } = renderWithQuery(() => useCityEntry(fakeLocation));
    await waitFor(() => expect(client.getQueryState(cityQueryKey)?.status).toBe("error"));

    // Assert
    expect(client.getQueryState(cityQueryKey)?.error).toBe(error);
    expect(result.current.cityToShow).toBeNull();
    expect(useVisitedCitiesStore.getState().visitedCityIds).toEqual([]);
  });

  it("usa query key com coordenadas arredondadas de dev", async () => {
    // Arrange
    mockedGetCityData.mockResolvedValueOnce(cityResponse);

    // Act
    const { result } = renderWithQuery(() => useCityEntry(fakeLocation));
    await waitFor(() => expect(result.current.cityToShow).toEqual(cityResponse));

    // Assert
    expect(client.getQueryData(cityQueryKey)).toEqual(cityResponse);
  });
});
