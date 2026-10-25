import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren } from "react";
import { usePendingOrder } from "@/src/features/user/payment/hooks/usePendingOrder";
import { getMyOrders } from "@/src/features/user/payment/services/orderService";
import {
  order,
  paidOrder,
  pendingOrder,
  createAxiosError,
} from "@/src/features/user/payment/__tests__/fixtures/payment";

jest.mock("@/src/features/user/payment/services/orderService", () => ({
  getMyOrders: jest.fn(),
}));

const mockedGetMyOrders = getMyOrders as jest.MockedFunction<
  typeof getMyOrders
>;

describe("usePendingOrder", () => {
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

  function renderUsePendingOrder() {
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    const rendered = renderHook(() => usePendingOrder(), { wrapper });
    unmount = rendered.unmount;
    return rendered;
  }

  it("retorna o primeiro pedido com status AWAITING_PAYMENT", async () => {
    // Arrange
    mockedGetMyOrders.mockResolvedValueOnce([paidOrder, pendingOrder, order]);

    // Act
    const { result } = renderUsePendingOrder();

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedGetMyOrders).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(pendingOrder);
  });

  it("retorna null quando não há pedido pendente", async () => {
    // Arrange
    mockedGetMyOrders.mockResolvedValueOnce([paidOrder]);

    // Act
    const { result } = renderUsePendingOrder();

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });

  it("expõe o erro quando o service falha", async () => {
    // Arrange
    const error = createAxiosError(500);
    mockedGetMyOrders.mockRejectedValueOnce(error);

    // Act
    const { result } = renderUsePendingOrder();

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(error);
  });
});
