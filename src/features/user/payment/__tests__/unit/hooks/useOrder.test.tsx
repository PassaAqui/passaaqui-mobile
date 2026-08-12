import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren } from "react";
import { useOrder } from "@/src/features/user/payment/hooks/useOrder";
import { getOrder } from "@/src/features/user/payment/services/orderService";
import {
  order,
  createAxiosError,
} from "@/src/features/user/payment/__tests__/fixtures/payment";

jest.mock("@/src/features/user/payment/services/orderService", () => ({
  getOrder: jest.fn(),
}));

const mockedGetOrder = getOrder as jest.MockedFunction<typeof getOrder>;

describe("useOrder", () => {
  let client: QueryClient;
  let unmount: (() => void) | null = null;

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
    unmount = null;
    client.clear();
  });

  function renderUseOrder(orderId: string | undefined) {
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    const rendered = renderHook(() => useOrder(orderId), { wrapper });
    unmount = rendered.unmount;
    return rendered;
  }

  it("não chama o service e mantém data undefined sem orderId", async () => {
    // Act
    const { result } = renderUseOrder(undefined);

    // Assert
    await waitFor(() => expect(result.current.isPending).toBe(true));
    expect(mockedGetOrder).not.toHaveBeenCalled();
    expect(result.current.data).toBeUndefined();
  });

  it("busca e retorna o pedido quando orderId é informado", async () => {
    // Arrange
    mockedGetOrder.mockResolvedValueOnce(order);

    // Act
    const { result } = renderUseOrder("ord-1");

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedGetOrder).toHaveBeenCalledWith("ord-1");
    expect(result.current.data).toEqual(order);
  });

  it("grava o pedido no cache com a query key ['order', 'ord-1']", async () => {
    // Arrange
    mockedGetOrder.mockResolvedValueOnce(order);

    // Act
    renderUseOrder("ord-1");
    await waitFor(() => {
      expect(client.getQueryState(["order", "ord-1"])?.status).toBe("success");
    });

    // Assert
    expect(client.getQueryData(["order", "ord-1"])).toEqual(order);
  });

  it("expõe o erro quando o service falha", async () => {
    // Arrange
    const error = createAxiosError(500);
    mockedGetOrder.mockRejectedValueOnce(error);

    // Act
    const { result } = renderUseOrder("ord-1");

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(error);
  });
});