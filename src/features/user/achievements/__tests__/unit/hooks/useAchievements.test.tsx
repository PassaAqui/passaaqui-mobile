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

  function renderUseAchievements() {
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );

    const { unmount: unmountFn, ...rest } = renderHook(() => useAchievements(), {
      wrapper,
    });
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

  it("grava as conquistas no cache com a query key ['achievements']", async () => {
    // Arrange
    mockedGetAchievements.mockResolvedValueOnce(achievements);

    // Act
    renderUseAchievements();
    await waitFor(() => {
      expect(client.getQueryState(["achievements"])?.status).toBe("success");
    });

    // Assert
    expect(client.getQueryData(["achievements"])).toEqual(achievements);
  });
});
