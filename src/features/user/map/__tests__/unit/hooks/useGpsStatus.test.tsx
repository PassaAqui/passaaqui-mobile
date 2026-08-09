import { act, renderHook } from "@testing-library/react-native";
import { AppState } from "react-native";
import { getCurrentPositionAsync } from "expo-location";
import { useGpsStatus } from "@/src/features/user/map/hooks/useGpsStatus";

jest.mock("expo-location", () => ({
  getCurrentPositionAsync: jest.fn(),
  LocationAccuracy: { Balanced: 3 },
}));

const mockedGetCurrentPosition =
  getCurrentPositionAsync as jest.MockedFunction<typeof getCurrentPositionAsync>;

describe("useGpsStatus", () => {
  let appStateCallback: ((state: string) => void) | null;
  let appStateRemove: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    appStateCallback = null;
    appStateRemove = jest.fn();
    jest.spyOn(AppState, "addEventListener").mockImplementation(((_type: any, handler: any) => {
      appStateCallback = handler;
      return { remove: appStateRemove } as any;
    }) as any);
    mockedGetCurrentPosition.mockResolvedValue({} as any);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("inicia com gpsActive true", () => {
    // Act
    const { result } = renderHook(() => useGpsStatus(0));

    // Assert
    expect(result.current.gpsActive).toBe(true);
  });

  it("no intervalo, com localização obtida, mantém gpsActive true", async () => {
    // Act
    const { result } = renderHook(() => useGpsStatus(0));
    await act(async () => {
      await jest.advanceTimersByTimeAsync(10000);
    });

    // Assert
    expect(mockedGetCurrentPosition).toHaveBeenCalledTimes(1);
    expect(result.current.gpsActive).toBe(true);
  });

  it("no intervalo, com erro na localização, define gpsActive false", async () => {
    // Arrange
    mockedGetCurrentPosition.mockRejectedValue(new Error("gps off"));

    // Act
    const { result } = renderHook(() => useGpsStatus(0));
    await act(async () => {
      await jest.advanceTimersByTimeAsync(10000);
    });

    // Assert
    expect(result.current.gpsActive).toBe(false);
  });

  it("ao voltar ao active no AppState, revalida o GPS e mantém gpsActive true", async () => {
    // Act
    const { result } = renderHook(() => useGpsStatus(0));
    await act(async () => {
      appStateCallback?.("active");
    });

    // Assert
    expect(mockedGetCurrentPosition).toHaveBeenCalled();
    expect(result.current.gpsActive).toBe(true);
  });

  it("no AppState active com erro de GPS, define gpsActive false", async () => {
    // Arrange
    mockedGetCurrentPosition.mockRejectedValue(new Error("gps off"));

    // Act
    const { result } = renderHook(() => useGpsStatus(0));
    await act(async () => {
      appStateCallback?.("active");
    });

    // Assert
    expect(result.current.gpsActive).toBe(false);
  });

  it("a cada nova lastUpdate, reseta o intervalo (timer anterior é limpo)", async () => {
    // Act
    const { rerender } = renderHook((lastUpdate: number) => useGpsStatus(lastUpdate), {
      initialProps: 0,
    });
    await act(async () => {
      await jest.advanceTimersByTimeAsync(10000);
    });
    expect(mockedGetCurrentPosition).toHaveBeenCalledTimes(1);

    rerender(1);
    await act(async () => {
      await jest.advanceTimersByTimeAsync(10000);
    });

    // Assert
    // Se o intervalo anterior não fosse limpo, seriam 3 chamadas (2 do velho + 1 do novo).
    expect(mockedGetCurrentPosition).toHaveBeenCalledTimes(2);
  });

  it("no unmount, remove o listener do AppState e limpa o intervalo", async () => {
    // Act
    const { unmount } = renderHook(() => useGpsStatus(0));
    unmount();

    // Assert
    expect(appStateRemove).toHaveBeenCalledTimes(1);
    await act(async () => {
      await jest.advanceTimersByTimeAsync(20000);
    });
    expect(mockedGetCurrentPosition).not.toHaveBeenCalled();
  });
});
