import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren } from "react";
import { useShopkeeperOrders } from "@/src/features/shopkeeper/orders/hooks/useShopkeeperOrders";
import { getShopkeeperOrders } from "@/src/features/shopkeeper/orders/services/ordersService";
import {
  apiOrders,
  createAxiosError,
} from "@/src/features/shopkeeper/orders/__tests__/fixtures/orders";

jest.mock("@/src/features/shopkeeper/orders/services/ordersService", () => ({
  getShopkeeperOrders: jest.fn(),
  getOrderById: jest.fn(),
}));

const mockedGetShopkeeperOrders =
  getShopkeeperOrders as jest.MockedFunction<typeof getShopkeeperOrders>;

describe("useShopkeeperOrders", () => {
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

  function renderUseShopkeeperOrders() {
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );

    const { unmount: unmountFn, ...rest } = renderHook(() => useShopkeeperOrders(), {
      wrapper,
    });
    unmount = unmountFn;

    return rest;
  }

  it("retorna os pedidos em caso de sucesso e registra a query", async () => {
    // Arrange
    mockedGetShopkeeperOrders.mockResolvedValueOnce(apiOrders);

    // Act
    const { result } = renderUseShopkeeperOrders();

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(apiOrders);
    expect(client.getQueryState(["shopkeeper-orders"])?.status).toBe("success");
  });

  it("expõe o erro quando o service falha", async () => {
    // Arrange
    const error = createAxiosError(500);
    mockedGetShopkeeperOrders.mockRejectedValueOnce(error);

    // Act
    const { result } = renderUseShopkeeperOrders();

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(error);
  });
});