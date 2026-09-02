import { act, renderHook } from "@testing-library/react-native";
import type { RefObject } from "react";
import type { LocationObject } from "expo-location";
import {
  getCurrentPositionAsync,
  requestForegroundPermissionsAsync,
  watchPositionAsync,
} from "expo-location";
import type { CameraRef } from "@maplibre/maplibre-react-native";
import { useLocation } from "@/src/features/user/map/hooks/useLocation";

jest.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  watchPositionAsync: jest.fn(),
  LocationAccuracy: { Balanced: 3, High: 5 },
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

const mockedRequestPermissions =
  requestForegroundPermissionsAsync as jest.MockedFunction<
    typeof requestForegroundPermissionsAsync
  >;
const mockedGetCurrentPosition =
  getCurrentPositionAsync as jest.MockedFunction<typeof getCurrentPositionAsync>;
const mockedWatchPosition = watchPositionAsync as jest.MockedFunction<typeof watchPositionAsync>;

const fakeLocation = {
  coords: { latitude: -8.0675, longitude: -34.9167 },
} as LocationObject;

// Camera ref mock — MapLibre usa jumpTo/easeTo
const jumpTo = jest.fn();
const easeTo = jest.fn();
const cameraRef = {
  current: { jumpTo, easeTo },
} as unknown as RefObject<CameraRef | null>;

describe("useLocation", () => {
  let watchCallback: ((loc: LocationObject) => void) | null;
  let removeFn: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
    watchCallback = null;
    removeFn = jest.fn();
    mockedRequestPermissions.mockResolvedValue({ granted: true } as any);
    mockedGetCurrentPosition.mockResolvedValue(fakeLocation as any);
    mockedWatchPosition.mockImplementation((_opts: any, cb: any) => {
      watchCallback = cb;
      return Promise.resolve({ remove: removeFn });
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  async function renderLocation() {
    const rendered = renderHook(() => useLocation(cameraRef));
    await act(async () => {});
    return rendered;
  }

  it("com permissão negada, não observa a posição e mantém location null", async () => {
    // Arrange
    mockedRequestPermissions.mockResolvedValue({ granted: false } as any);

    // Act
    const { result } = await renderLocation();

    // Assert
    expect(mockedWatchPosition).not.toHaveBeenCalled();
    expect(result.current.location).toBeNull();
  });

  it("com permissão concedida, observa a posição e atualiza location no callback", async () => {
    // Act
    const { result } = await renderLocation();
    act(() => watchCallback?.(fakeLocation));

    // Assert
    expect(mockedWatchPosition).toHaveBeenCalledTimes(1);
    expect(result.current.location).toBe(fakeLocation);
  });

  it("quando a localização falha em todas as tentativas, não observa a posição", async () => {
    // Arrange
    jest.useFakeTimers();
    mockedGetCurrentPosition.mockRejectedValue(new Error("sem sinal"));

    // Act
    const { result } = renderHook(() => useLocation(cameraRef));
    await act(async () => {
      await jest.runAllTimersAsync();
    });

    // Assert
    expect(mockedWatchPosition).not.toHaveBeenCalled();
    expect(result.current.location).toBeNull();
  });

  it("com mapReady e location, pula para a região fixa de dev", async () => {
    // Act
    const { result } = await renderLocation();
    act(() => watchCallback?.(fakeLocation));
    act(() => result.current.setMapReady(true));

    // Assert
    expect(jumpTo).toHaveBeenCalledTimes(1);
    expect(jumpTo).toHaveBeenCalledWith({
      center: [-34.9167, -8.0675],
      zoom: 15,
    });
  });

  it("chama easeTo com coordenadas reais quando isFollowing é true (fix: ref evita stale closure)", async () => {
    // Act
    const { result } = await renderLocation();
    act(() => result.current.setIsFollowing(true));
    act(() => watchCallback?.(fakeLocation));

    // Assert
    // Com o fix usando useRef, o callback agora lê o valor atualizado de isFollowing
    // e usa as coordenadas reais do response.coords
    expect(easeTo).toHaveBeenCalledTimes(1);
    expect(easeTo).toHaveBeenCalledWith({
      center: [-34.9167, -8.0675],
    });
  });

  it("no unmount, remove a subscription do watch", async () => {
    // Act
    const { unmount } = await renderLocation();
    unmount();

    // Assert
    expect(removeFn).toHaveBeenCalled();
  });
});
