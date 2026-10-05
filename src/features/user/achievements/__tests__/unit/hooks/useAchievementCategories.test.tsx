import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren } from "react";
import { useAchievementCategories } from "@/src/features/user/achievements/hooks/useAchievementCategories";
import { getAchievementCategories } from "@/src/features/user/achievements/services/achievementService";
import {
  achievementCategories,
  createAxiosError,
} from "@/src/features/user/achievements/__tests__/fixtures/achievement";

jest.mock("@/src/features/user/achievements/services/achievementService", () => ({
  getAchievementCategories: jest.fn(),
}));

const mockedGetAchievementCategories =
  getAchievementCategories as jest.MockedFunction<typeof getAchievementCategories>;

describe("useAchievementCategories", () => {
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

  function renderUseAchievementCategories() {
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );

    const { unmount: unmountFn, ...rest } = renderHook(
      () => useAchievementCategories(),
      { wrapper }
    );
    unmount = unmountFn;

    return rest;
  }

  it("retorna as categorias em caso de sucesso", async () => {
    // Arrange
    mockedGetAchievementCategories.mockResolvedValueOnce(achievementCategories);

    // Act
    const { result } = renderUseAchievementCategories();

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(achievementCategories);
  });

  it("grava as categorias no cache com a query key ['achievement-categories']", async () => {
    // Arrange
    mockedGetAchievementCategories.mockResolvedValueOnce(achievementCategories);

    // Act
    renderUseAchievementCategories();
    await waitFor(() => {
      expect(
        client.getQueryState(["achievement-categories"])?.status
      ).toBe("success");
    });

    // Assert
    expect(client.getQueryData(["achievement-categories"])).toEqual(
      achievementCategories
    );
  });

  it("expõe o erro quando o service falha", async () => {
    // Arrange
    const error = createAxiosError(500);
    mockedGetAchievementCategories.mockRejectedValueOnce(error);

    // Act
    const { result } = renderUseAchievementCategories();

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(error);
  });
});
