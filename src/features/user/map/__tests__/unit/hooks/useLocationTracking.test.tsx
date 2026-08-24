import { renderHook } from "@testing-library/react-native";
import { AxiosError } from "axios";
import type { LocationObject } from "expo-location";
import { useLocationTracking } from "@/src/features/user/map/hooks/useLocationTracking";
import { useUpdateRouteLocation } from "@/src/features/user/map/hooks/useRouteSession";
import { startRouteSession } from "@/src/services/routeService";

jest.mock("@/src/features/user/map/hooks/useRouteSession", () => ({
  useUpdateRouteLocation: jest.fn(),
}));

jest.mock("@/src/services/routeService", () => ({
  startRouteSession: jest.fn(),
  haversineDistance: jest.fn((c1, c2) => 0.01),
}));

const mockedUseUpdateRouteLocation =
  useUpdateRouteLocation as jest.MockedFunction<typeof useUpdateRouteLocation>;
const mockedStartRouteSession = startRouteSession as jest.MockedFunction<typeof startRouteSession>;

// O hook só checa `!!location`; as coordenadas enviadas são fixas em dev.
const fakeLocation = {
  coords: { latitude: -8.0675, longitude: -34.9167 },
} as LocationObject;

const devCoords = { latitude: -8.0675, longitude: -34.9167 };

// AxiosError real (o hook checa `error instanceof AxiosError`).
function createAxiosErrorStatus(status: number) {
  return new AxiosError("Request failed", undefined, undefined, undefined, {
    status,
    data: {},
  } as any);
}

describe("useLocationTracking", () => {
  let mutateAsync: jest.Mock;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    mutateAsync = jest.fn().mockResolvedValue(undefined);
    mockedUseUpdateRouteLocation.mockReturnValue({ mutateAsync } as any);
    mockedStartRouteSession.mockResolvedValue({} as any);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  // Dispara um tick do setInterval de 5000ms e espera o callback async terminar.
  async function runIntervalCycle() {
    jest.advanceTimersByTime(5000);
    await Promise.resolve();
  }

  it("com active false, não cria intervalo e não chama mutateAsync", () => {
    // Act
    renderHook(() => useLocationTracking(fakeLocation, false));
    jest.advanceTimersByTime(15000);

    // Assert
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it("com paused true, não cria intervalo e não chama mutateAsync (parâmetro temporário de debug)", () => {
    // Act
    renderHook(() => useLocationTracking(fakeLocation, true, true));
    jest.advanceTimersByTime(15000);

    // Assert
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it("com active true e sem location, o callback roda sem chamar mutateAsync", async () => {
    // Act
    renderHook(() => useLocationTracking(null, true));
    await runIntervalCycle();

    // Assert
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it("com active true e location, envia as coordenadas de dev a cada tick", async () => {
    // Act
    renderHook(() => useLocationTracking(fakeLocation, true));
    await runIntervalCycle();

    // Assert
    expect(mutateAsync).toHaveBeenCalledTimes(1);
    expect(mutateAsync).toHaveBeenCalledWith(devCoords);
  });

  it("com erro 400 do mutateAsync, recria a sessão com as coordenadas", async () => {
    // Arrange
    mutateAsync.mockRejectedValueOnce(createAxiosErrorStatus(400));

    // Act
    renderHook(() => useLocationTracking(fakeLocation, true));
    await runIntervalCycle();

    // Assert
    expect(mockedStartRouteSession).toHaveBeenCalledTimes(1);
    expect(mockedStartRouteSession).toHaveBeenCalledWith(devCoords);
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("[tracking WARN]"));
  });

  it("com erro 401/403, para o intervalo e não envia mais atualizações", async () => {
    // Arrange
    mutateAsync.mockRejectedValueOnce(createAxiosErrorStatus(401));

    // Act
    renderHook(() => useLocationTracking(fakeLocation, true));
    await runIntervalCycle();
    await runIntervalCycle();

    // Assert
    expect(mutateAsync).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining("Falha de autenticação")
    );
  });

  it("com erro inesperado, apenas loga e mantém o intervalo ativo", async () => {
    // Arrange
    mutateAsync.mockRejectedValueOnce(createAxiosErrorStatus(500));

    // Act
    renderHook(() => useLocationTracking(fakeLocation, true));
    await runIntervalCycle();
    await runIntervalCycle();

    // Assert
    expect(mutateAsync).toHaveBeenCalledTimes(2);
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining("[tracking ERROR] Erro inesperado"),
      expect.anything()
    );
  });

  it("limpa o intervalo no unmount", async () => {
    // Arrange
    const { unmount } = renderHook(() => useLocationTracking(fakeLocation, true));
    await runIntervalCycle();
    expect(mutateAsync).toHaveBeenCalledTimes(1);

    // Act
    unmount();
    await runIntervalCycle();

    // Assert
    expect(mutateAsync).toHaveBeenCalledTimes(1);
  });
});
