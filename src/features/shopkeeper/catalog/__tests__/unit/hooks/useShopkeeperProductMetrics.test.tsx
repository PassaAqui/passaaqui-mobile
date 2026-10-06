import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren } from "react";
import { useShopkeeperProductMetrics } from "@/src/features/shopkeeper/catalog/hooks/useShopkeeperProductMetrics";
import { getShopkeeperProductMetrics } from "@/src/features/shopkeeper/catalog/services/shopkeeperProductsService";
import { metrics } from "@/src/features/shopkeeper/catalog/__tests__/fixtures/catalog";
import { createAxiosError } from "@/src/features/shopkeeper/auth/__tests__/fixtures/shopkeeper";

jest.mock(
  "@/src/features/shopkeeper/catalog/services/shopkeeperProductsService",
  () => ({
    getShopkeeperProductMetrics: jest.fn(),
  })
);

const mockedGetShopkeeperProductMetrics =
  getShopkeeperProductMetrics as jest.MockedFunction<
    typeof getShopkeeperProductMetrics
  >;

describe("useShopkeeperProductMetrics", () => {
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

  function renderUseShopkeeperProductMetrics() {
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );

    const { unmount: unmountFn, ...rest } = renderHook(
      () => useShopkeeperProductMetrics(),
      { wrapper }
    );
    unmount = unmountFn;

    return rest;
  }

  it("retorna as métricas em caso de sucesso e registra a query", async () => {
    // Arrange
    mockedGetShopkeeperProductMetrics.mockResolvedValueOnce(metrics);

    // Act
    const { result } = renderUseShopkeeperProductMetrics();

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(metrics);
    expect(client.getQueryState(["shopkeeper-product-metrics"])?.status).toBe(
      "success"
    );
  });

  it("expõe o erro quando o service falha", async () => {
    // Arrange
    const error = createAxiosError(500);
    mockedGetShopkeeperProductMetrics.mockRejectedValueOnce(error);

    // Act
    const { result } = renderUseShopkeeperProductMetrics();

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(error);
  });
});