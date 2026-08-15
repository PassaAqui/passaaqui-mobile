import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren } from "react";
import { useOrderById } from "@/src/features/shopkeeper/orders/hooks/useOrderById";
import { getOrderById } from "@/src/features/shopkeeper/orders/services/ordersService";
import {
  createAxiosError,
  orderDetail,
} from "@/src/features/shopkeeper/orders/__tests__/fixtures/orders";

jest.mock("@/src/features/shopkeeper/orders/services/ordersService", () => ({
  getShopkeeperOrders: jest.fn(),
  getOrderById: jest.fn(),
}));

const mockedGetOrderById = getOrderById as jest.MockedFunction<typeof getOrderById>;

describe("useOrderById", () => {
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

  function renderUseOrderById(id: string | undefined) {
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );

    const { unmount: unmountFn, ...rest } = renderHook(() => useOrderById(id), {
      wrapper,
    });
    unmount = unmountFn;

    return rest;
  }

  it("desabilita a query quando o id é undefined", async () => {
    // Act
    const { result } = renderUseOrderById(undefined);

    // Assert
    await waitFor(() => expect(result.current.isPending).toBe(true));
    expect(mockedGetOrderById).not.toHaveBeenCalled();
    expect(result.current.data).toBeUndefined();
  });

  it("retorna o pedido em caso de sucesso e registra a query", async () => {
    // Arrange
    mockedGetOrderById.mockResolvedValueOnce(orderDetail);

    // Act
    const { result } = renderUseOrderById("ord-1");

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedGetOrderById).toHaveBeenCalledWith("ord-1");
    expect(result.current.data).toEqual(orderDetail);
    expect(client.getQueryState(["order-detail", "ord-1"])?.status).toBe("success");
  });

  it("expõe o erro quando o service falha", async () => {
    // Arrange
    const error = createAxiosError(500);
    mockedGetOrderById.mockRejectedValueOnce(error);

    // Act
    const { result } = renderUseOrderById("ord-1");

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(error);
  });
});