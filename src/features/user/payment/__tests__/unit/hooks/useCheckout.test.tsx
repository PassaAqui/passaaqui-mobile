import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren } from "react";
import { useCheckout } from "@/src/features/user/payment/hooks/useCheckout";
import { checkoutOrder } from "@/src/features/user/payment/services/orderService";
import { useOrderStore } from "@/src/stores/user/payment/orderStore";
import {
  order,
  createAxiosError,
} from "@/src/features/user/payment/__tests__/fixtures/payment";

jest.mock("@/src/features/user/payment/services/orderService", () => ({
  checkoutOrder: jest.fn(),
}));

const mockedCheckoutOrder = checkoutOrder as jest.MockedFunction<typeof checkoutOrder>;

describe("useCheckout", () => {
  let client: QueryClient;
  let unmount: (() => void) | null = null;

  beforeEach(() => {
    jest.clearAllMocks();
    useOrderStore.setState({ order: null });
    client = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
        // Sem gcTime: 0, a mutation agenda um setTimeout de GC (padrão 5 min) ao
        // desmontar o observer, mantendo o Jest vivo ("did not exit gracefully").
        mutations: { gcTime: 0 },
      },
    });
  });

  afterEach(() => {
    unmount?.();
    unmount = null;
    client.clear();
    useOrderStore.setState({ order: null });
  });

  function renderUseCheckout() {
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    const rendered = renderHook(() => useCheckout(), { wrapper });
    unmount = rendered.unmount;
    return rendered;
  }

  it("grava o pedido no store após o checkout com sucesso", async () => {
    // Arrange
    mockedCheckoutOrder.mockResolvedValueOnce(order);

    // Act
    const { result } = renderUseCheckout();
    await result.current.mutateAsync(1);

    // Assert
    expect(mockedCheckoutOrder).toHaveBeenCalledWith(1);
    expect(useOrderStore.getState().order).toBe(order);
  });

  it("não grava nada no store quando o checkout falha", async () => {
    // Arrange
    const error = createAxiosError(500);
    mockedCheckoutOrder.mockRejectedValueOnce(error);

    // Act
    const { result } = renderUseCheckout();
    await expect(result.current.mutateAsync(1)).rejects.toBe(error);

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(error);
    expect(useOrderStore.getState().order).toBeNull();
  });

  it("chama o service com o productId passado à mutation", async () => {
    // Arrange
    mockedCheckoutOrder.mockResolvedValueOnce(order);

    // Act
    const { result } = renderUseCheckout();
    await result.current.mutateAsync(7);

    // Assert
    expect(mockedCheckoutOrder).toHaveBeenCalledWith(7);
  });

  it("sai de isPending após o sucesso do checkout", async () => {
    // Arrange
    mockedCheckoutOrder.mockResolvedValueOnce(order);

    // Act
    const { result } = renderUseCheckout();
    await result.current.mutateAsync(1);

    // Assert
    await waitFor(() => expect(result.current.isPending).toBe(false));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});