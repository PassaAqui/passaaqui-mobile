import { act, renderHook } from "@testing-library/react-native";
import type { LocationObject } from "expo-location";
import {
  getCurrentPositionAsync,
  requestForegroundPermissionsAsync,
  watchPositionAsync,
} from "expo-location";
import { useLocation } from "@/src/features/user/map/hooks/useLocation";

jest.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  watchPositionAsync: jest.fn(),
  LocationAccuracy: { Balanced: 3, High: 5 },
}));

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

const devRegion = {
  latitude: -8.0675,
  longitude: -34.9167,
  latitudeDelta: 0.005,
  longitudeDelta: 0.005,
};

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
    const rendered = renderHook(() => useLocation());
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
    const { result } = renderHook(() => useLocation());
    await act(async () => {
      await jest.runAllTimersAsync();
    });

    // Assert
    expect(mockedWatchPosition).not.toHaveBeenCalled();
    expect(result.current.location).toBeNull();
  });

  it("com mapReady e location, anima para a região fixa de dev", async () => {
    // Arrange
    const mapRefMock = { animateToRegion: jest.fn(), animateCamera: jest.fn() };

    // Act
    const { result } = await renderLocation();
    result.current.mapRef.current = mapRefMock as any;
    act(() => watchCallback?.(fakeLocation));
    act(() => result.current.setMapReady(true));

    // Assert
    expect(mapRefMock.animateToRegion).toHaveBeenCalledTimes(1);
    expect(mapRefMock.animateToRegion).toHaveBeenCalledWith(devRegion);
  });

  it("chama animateCamera com coordenadas reais quando isFollowing é true (fix: ref evita stale closure)", async () => {
    // Arrange
    const mapRefMock = { animateToRegion: jest.fn(), animateCamera: jest.fn() };

    // Act
    const { result } = await renderLocation();
    result.current.mapRef.current = mapRefMock as any;
    act(() => result.current.setIsFollowing(true));
    act(() => watchCallback?.(fakeLocation));

    // Assert
    // Com o fix usando useRef, o callback agora lê o valor atualizado de isFollowing
    // e usa as coordenadas reais do response.coords
    // Em ambiente de teste (__DEV__ = true), auto-follow não dispara, só isFollowingRef
    expect(mapRefMock.animateCamera).toHaveBeenCalledTimes(1);
    expect(mapRefMock.animateCamera).toHaveBeenCalledWith({
      center: { latitude: -8.0675, longitude: -34.9167 },
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
