import { act, renderHook, waitFor } from "@testing-library/react-native";
import type { RefObject } from "react";
import type { CameraRef, MapRef } from "@maplibre/maplibre-react-native";
import type { LocationObject } from "expo-location";
import { useNavigation } from "@/src/features/user/map/hooks/useNavigation";
import {
  useCurrentRouteSession,
  useDirection,
  useEndRouteSession,
  useStartRouteSession,
} from "@/src/features/user/map/hooks/useRouteSession";
import { getDirection } from "@/src/services/routeService";
import { routeSession } from "@/src/features/user/map/__tests__/fixtures/map";

jest.mock("@/src/features/user/map/hooks/useRouteSession", () => ({
  useStartRouteSession: jest.fn(),
  useDirection: jest.fn(),
  useEndRouteSession: jest.fn(),
  useCurrentRouteSession: jest.fn(),
}));

jest.mock("@/src/services/routeService", () => ({
  getDirection: jest.fn(),
}));

jest.mock("@maplibre/maplibre-react-native", () => {
  const React = require("react");
  const { View } = require("react-native");
  const Map = React.forwardRef(
    ({ children, ...props }: any, _ref: unknown) => (
      <View {...props}>{children}</View>
    )
  );
  Map.displayName = "Map";
  return {
    __esModule: true,
    Map,
    Camera: React.forwardRef(
      ({ children, ...props }: any, _ref: unknown) => (
        <View {...props}>{children}</View>
      )
    ),
    Marker: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    GeoJSONSource: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    Layer: ({ children, ...props }: any) => <View {...props}>{children}</View>,
  };
});

const mockedUseStartRouteSession =
  useStartRouteSession as jest.MockedFunction<typeof useStartRouteSession>;
const mockedUseDirection = useDirection as jest.MockedFunction<typeof useDirection>;
const mockedUseEndRouteSession =
  useEndRouteSession as jest.MockedFunction<typeof useEndRouteSession>;
const mockedUseCurrentRouteSession =
  useCurrentRouteSession as jest.MockedFunction<typeof useCurrentRouteSession>;
const mockedGetDirection = getDirection as jest.MockedFunction<typeof getDirection>;

const coordinates = [
  { latitude: -8.0608, longitude: -34.8699 },
  { latitude: -8.0589, longitude: -34.8681 },
];

// O hook recebe (location, mapRef, cameraRef), mas as coordenadas de origem da navegação
// são fixas em dev (MARCO_ZERO_RECIFE) — o location não é lido.
const fakeLocation = {
  coords: { latitude: -8.0675, longitude: -34.9167 },
} as LocationObject;

// Referências aos mocks do mapRef
const mapRef = {
  current: {},
} as unknown as RefObject<MapRef | null>;

// Referência ao mock do cameraRef (MapLibre usa fitBounds em vez de fitToCoordinates)
const fitBounds = jest.fn();
const cameraRef = {
  current: { fitBounds },
} as unknown as RefObject<CameraRef | null>;

describe("useNavigation", () => {
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    mockedUseStartRouteSession.mockReturnValue({
      isPending: false,
      mutateAsync: jest.fn().mockResolvedValue(routeSession),
    } as any);
    mockedUseDirection.mockReturnValue({
      isPending: false,
      mutateAsync: jest.fn().mockResolvedValue({ coordinates: [], distance: "1.9", duration: 8 }),
    } as any);
    mockedUseEndRouteSession.mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue(undefined),
    } as any);
    // Sessão padrão: restore no mount não restaura nada.
    mockedUseCurrentRouteSession.mockReturnValue({
      refetch: jest.fn().mockResolvedValue({ data: null }),
    } as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function renderNavigation() {
    return renderHook(() => useNavigation(fakeLocation, mapRef, cameraRef));
  }

  it("restaura sessão ativa e traça a rota salva", async () => {
    // Arrange
    const destination = routeSession.destination!;
    mockedUseCurrentRouteSession.mockReturnValue({
      refetch: jest.fn().mockResolvedValue({ data: routeSession }),
    } as any);
    mockedGetDirection.mockResolvedValue({ coordinates, distance: "1.9", duration: 8 });

    // Act
    const { result } = renderNavigation();

    // Assert
    await waitFor(() => expect(result.current.routeCoords).toEqual(coordinates));
    expect(result.current.stop).toBe(true);
    expect(mockedGetDirection).toHaveBeenCalledWith({
      mode: destination.mode,
      startLatitude: destination.startLatitude,
      startLongitude: destination.startLongitude,
      endLatitude: destination.stopLatitude,
      endLongitude: destination.stopLongitude,
      poiId: destination.poiId,
    });
  });

  it("sem sessão ativa, não traça rota e mantém stop false", async () => {
    // Arrange
    const refetch = jest.fn().mockResolvedValue({ data: { status: "INACTIVE" } });
    mockedUseCurrentRouteSession.mockReturnValue({ refetch } as any);

    // Act
    const { result } = renderNavigation();

    // Assert
    await waitFor(() => expect(refetch).toHaveBeenCalled());
    expect(mockedGetDirection).not.toHaveBeenCalled();
    expect(result.current.stop).toBe(false);
    expect(result.current.routeCoords).toEqual([]);
  });

  it("ignora erro no restore da sessão", async () => {
    // Arrange
    const refetch = jest.fn().mockRejectedValue(new Error("falha ao restaurar"));
    mockedUseCurrentRouteSession.mockReturnValue({ refetch } as any);

    // Act
    const { result } = renderNavigation();

    // Assert
    await waitFor(() => expect(refetch).toHaveBeenCalled());
    expect(result.current.stop).toBe(false);
    expect(mockedGetDirection).not.toHaveBeenCalled();
  });

  it("sem navegação em andamento, traça a rota e ajusta o mapa via cameraRef", async () => {
    // Arrange
    const startMutateAsync = jest.fn().mockResolvedValue(routeSession);
    const directionMutateAsync = jest.fn().mockResolvedValue({
      coordinates,
      distance: "1.9",
      duration: 8,
    });
    mockedUseStartRouteSession.mockReturnValue({
      isPending: false,
      mutateAsync: startMutateAsync,
    } as any);
    mockedUseDirection.mockReturnValue({
      isPending: false,
      mutateAsync: directionMutateAsync,
    } as any);
    const destination = { latitude: -8.05, longitude: -34.87 };

    // Act
    const { result } = renderNavigation();
    await act(async () => {
      result.current.handleNavigation(destination, "foot-walking", 5);
    });

    // Assert
    await waitFor(() => expect(result.current.stop).toBe(true));
    expect(result.current.routeCoords).toEqual(coordinates);
    expect(startMutateAsync).toHaveBeenCalledWith({
      latitude: -8.0675,
      longitude: -34.9167,
      poiId: 5,
    });
    expect(directionMutateAsync).toHaveBeenCalledWith({
      mode: "foot-walking",
      startLatitude: -8.0675,
      startLongitude: -34.9167,
      endLatitude: destination.latitude,
      endLongitude: destination.longitude,
      poiId: 5,
    });
    // MapLibre: fitToCoordinates é substituído por cameraRef.fitBounds com bounds [west, south, east, north]
    expect(fitBounds).toHaveBeenCalledWith(
      [-34.8699, -8.0608, -34.8681, -8.0589],
      { padding: { top: 80, right: 40, bottom: 80, left: 40 } }
    );
  });

  it("com navegação em andamento, abre o modal de troca de destino", async () => {
    // Arrange
    const startMutateAsync = jest.fn().mockResolvedValue(routeSession);
    mockedUseStartRouteSession.mockReturnValue({
      isPending: false,
      mutateAsync: startMutateAsync,
    } as any);

    // Act
    const { result } = renderNavigation();
    act(() => result.current.setStop(true));
    await act(async () => {
      result.current.handleNavigation({ latitude: -8.05, longitude: -34.87 }, "driving-car", 7);
    });

    // Assert
    expect(result.current.showSwitchDestinationModal).toBe(true);
    expect(startMutateAsync).not.toHaveBeenCalled();
  });

  it("confirma a troca de destino, encerra a rota anterior e navega", async () => {
    // Arrange
    const endMutateAsync = jest.fn().mockResolvedValue(undefined);
    const startMutateAsync = jest.fn().mockResolvedValue(routeSession);
    const directionMutateAsync = jest.fn().mockResolvedValue({
      coordinates,
      distance: "1.9",
      duration: 8,
    });
    mockedUseEndRouteSession.mockReturnValue({ mutateAsync: endMutateAsync } as any);
    mockedUseStartRouteSession.mockReturnValue({
      isPending: false,
      mutateAsync: startMutateAsync,
    } as any);
    mockedUseDirection.mockReturnValue({
      isPending: false,
      mutateAsync: directionMutateAsync,
    } as any);

    // Act
    const { result } = renderNavigation();
    act(() => result.current.setStop(true));
    await act(async () => {
      result.current.handleNavigation({ latitude: -8.05, longitude: -34.87 }, "cycling-regular", 9);
    });
    await act(async () => {
      await result.current.confirmSwitchDestination();
    });

    // Assert
    expect(endMutateAsync).toHaveBeenCalled();
    expect(result.current.showSwitchDestinationModal).toBe(false);
    expect(result.current.routeCoords).toEqual(coordinates);
    expect(startMutateAsync).toHaveBeenCalledWith({
      latitude: -8.0675,
      longitude: -34.9167,
      poiId: 9,
    });
    expect(result.current.stop).toBe(true);
  });

  it("cancela a troca de destino e fecha o modal", async () => {
    // Act
    const { result } = renderNavigation();
    act(() => result.current.setStop(true));
    await act(async () => {
      result.current.handleNavigation({ latitude: -8.05, longitude: -34.87 }, "foot-walking", 3);
    });
    expect(result.current.showSwitchDestinationModal).toBe(true);

    act(() => result.current.cancelSwitchDestination());

    // Assert
    expect(result.current.showSwitchDestinationModal).toBe(false);
  });

  it("encerra a navegação e limpa a rota", async () => {
    // Arrange
    const endMutateAsync = jest.fn().mockResolvedValue(undefined);
    mockedUseEndRouteSession.mockReturnValue({ mutateAsync: endMutateAsync } as any);

    // Act
    const { result } = renderNavigation();
    act(() => result.current.setStop(true));
    act(() => result.current.setShowStopConfirmation(true));
    await act(async () => {
      await result.current.handleStopNavigation();
    });

    // Assert
    expect(endMutateAsync).toHaveBeenCalled();
    expect(result.current.stop).toBe(false);
    expect(result.current.routeCoords).toEqual([]);
    expect(result.current.showStopConfirmation).toBe(false);
  });

  it("com erro ao traçar a rota, mantém o stop ativo no finally", async () => {
    // Arrange
    mockedUseStartRouteSession.mockReturnValue({
      isPending: false,
      mutateAsync: jest.fn().mockRejectedValue(new Error("falha na API")),
    } as any);

    // Act
    const { result } = renderNavigation();
    await act(async () => {
      result.current.handleNavigation({ latitude: -8.05, longitude: -34.87 }, "foot-walking", 4);
    });

    // Assert
    await waitFor(() => expect(result.current.stop).toBe(true));
    expect(result.current.routeCoords).toEqual([]);
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("Erro ao traçar a rota"));
  });
});
