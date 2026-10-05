import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren } from "react";
import { useAchievements } from "@/src/features/user/achievements/hooks/useAchievements";
import { getAchievements } from "@/src/features/user/achievements/services/achievementService";
import {
  achievements,
  createAxiosError,
} from "@/src/features/user/achievements/__tests__/fixtures/achievement";

jest.mock("@/src/features/user/achievements/services/achievementService", () => ({
  getAchievements: jest.fn(),
}));

const mockedGetAchievements = getAchievements as jest.MockedFunction<
  typeof getAchievements
>;

describe("useAchievements", () => {
  let client: QueryClient;
  let unmount: () => void;

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
    client.clear();
  });

  function renderUseAchievements(category?: string) {
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );

    const { unmount: unmountFn, ...rest } = renderHook(
      () => useAchievements(category),
      { wrapper }
    );
    unmount = unmountFn;

    return rest;
  }

  it("retorna as conquistas em caso de sucesso", async () => {
    // Arrange
    mockedGetAchievements.mockResolvedValueOnce(achievements);

    // Act
    const { result } = renderUseAchievements();

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(achievements);
  });

  it("chama o service sem categoria quando nenhum filtro é informado", async () => {
    // Arrange
    mockedGetAchievements.mockResolvedValueOnce(achievements);

    // Act
    renderUseAchievements();

    // Assert
    await waitFor(() => expect(mockedGetAchievements).toHaveBeenCalledWith(undefined));
  });

  it("repassa a categoria para o service e a usa na query key", async () => {
    // Arrange
    mockedGetAchievements.mockResolvedValueOnce(achievements);

    // Act
    renderUseAchievements("SABORES_DA_MATA");

    // Assert
    await waitFor(() =>
      expect(mockedGetAchievements).toHaveBeenCalledWith("SABORES_DA_MATA")
    );
    expect(client.getQueryData(["achievements", "SABORES_DA_MATA"])).toEqual(
      achievements
    );
  });

  it("usa a query key ['achievements', null] quando não há categoria", async () => {
    // Arrange
    mockedGetAchievements.mockResolvedValueOnce(achievements);

    // Act
    renderUseAchievements();

    // Assert
    await waitFor(() => {
      expect(client.getQueryState(["achievements", null])?.status).toBe("success");
    });
    expect(client.getQueryData(["achievements", null])).toEqual(achievements);
  });

  it("expõe o erro quando o service falha", async () => {
    // Arrange
    const error = createAxiosError(500);
    mockedGetAchievements.mockRejectedValueOnce(error);

    // Act
    const { result } = renderUseAchievements();

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(error);
  });
});
