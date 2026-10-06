import { getCurrentPositionAsync } from "expo-location";
import { waitForLocation } from "@/src/features/user/map/utils/waitForLocation";

jest.mock("expo-location", () => ({
  getCurrentPositionAsync: jest.fn(),
  LocationAccuracy: { Balanced: 3, High: 5 },
}));

const mockedGetCurrentPosition =
  getCurrentPositionAsync as jest.MockedFunction<typeof getCurrentPositionAsync>;

describe("waitForLocation", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it("retorna true quando a posição é obtida na primeira tentativa", async () => {
    // Arrange
    mockedGetCurrentPosition.mockResolvedValue({} as any);

    // Act
    const result = await waitForLocation();

    // Assert
    expect(result).toBe(true);
    expect(mockedGetCurrentPosition).toHaveBeenCalledTimes(1);
    expect(mockedGetCurrentPosition).toHaveBeenCalledWith({ accuracy: 3 });
  });

  it("tenta novamente após uma falha e retorna true no sucesso", async () => {
    // Arrange
    jest.useFakeTimers();
    mockedGetCurrentPosition
      .mockRejectedValueOnce(new Error("sem sinal"))
      .mockResolvedValueOnce({} as any);

    // Act
    const promise = waitForLocation(2, 100);
    await jest.runAllTimersAsync();

    // Assert
    await expect(promise).resolves.toBe(true);
    expect(mockedGetCurrentPosition).toHaveBeenCalledTimes(2);
  });

  it("retorna false quando falha em todas as tentativas", async () => {
    // Arrange
    jest.useFakeTimers();
    mockedGetCurrentPosition.mockRejectedValue(new Error("sem sinal"));

    // Act
    const promise = waitForLocation(3, 100);
    await jest.runAllTimersAsync();

    // Assert
    await expect(promise).resolves.toBe(false);
    expect(mockedGetCurrentPosition).toHaveBeenCalledTimes(3);
  });

  it("usa maxRetries padrão de 5 quando não informado", async () => {
    // Arrange
    jest.useFakeTimers();
    mockedGetCurrentPosition.mockRejectedValue(new Error("sem sinal"));

    // Act
    const promise = waitForLocation();
    await jest.runAllTimersAsync();

    // Assert
    await expect(promise).resolves.toBe(false);
    expect(mockedGetCurrentPosition).toHaveBeenCalledTimes(5);
  });

  it("aguarda o delayMs entre as tentativas", async () => {
    // Arrange
    jest.useFakeTimers();
    mockedGetCurrentPosition.mockRejectedValue(new Error("sem sinal"));

    // Act
    const promise = waitForLocation(3, 100);
    await jest.advanceTimersByTimeAsync(50);

    // Assert
    expect(mockedGetCurrentPosition).toHaveBeenCalledTimes(1);

    // Act
    await jest.advanceTimersByTimeAsync(50);

    // Assert
    expect(mockedGetCurrentPosition).toHaveBeenCalledTimes(2);

    // Act
    await jest.runAllTimersAsync();
    await expect(promise).resolves.toBe(false);
    expect(mockedGetCurrentPosition).toHaveBeenCalledTimes(3);
  });
});
