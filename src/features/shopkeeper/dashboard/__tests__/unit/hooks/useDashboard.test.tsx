import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren } from "react";
import { useDashboard } from "@/src/features/shopkeeper/dashboard/hooks/useDashboard";
import { getDashboard } from "@/src/features/shopkeeper/dashboard/services/dashboardService";
import { dashboard } from "@/src/features/shopkeeper/dashboard/__tests__/fixtures/dashboard";
import { createAxiosError } from "@/src/features/shopkeeper/auth/__tests__/fixtures/shopkeeper";

jest.mock("@/src/features/shopkeeper/dashboard/services/dashboardService", () => ({
  getDashboard: jest.fn(),
}));

const mockedGetDashboard = getDashboard as jest.MockedFunction<typeof getDashboard>;

describe("useDashboard", () => {
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

  function renderUseDashboard() {
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );

    const { unmount: unmountFn, ...rest } = renderHook(() => useDashboard(), {
      wrapper,
    });
    unmount = unmountFn;

    return rest;
  }

  it("retorna o dashboard em caso de sucesso e registra a query", async () => {
    // Arrange
    mockedGetDashboard.mockResolvedValueOnce(dashboard);

    // Act
    const { result } = renderUseDashboard();

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(dashboard);
    expect(client.getQueryState(["dashboard"])?.status).toBe("success");
  });

  it("expõe o erro quando o service falha", async () => {
    // Arrange
    const error = createAxiosError(500);
    mockedGetDashboard.mockRejectedValueOnce(error);

    // Act
    const { result } = renderUseDashboard();

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(error);
  });
});