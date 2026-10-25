import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren } from "react";
import { useOrderSummary } from "@/src/features/user/payment/hooks/useOrderSummary";
import { getOrderSummary } from "@/src/features/user/payment/services/orderService";
import {
  orderSummary,
  createAxiosError,
} from "@/src/features/user/payment/__tests__/fixtures/payment";

jest.mock("@/src/features/user/payment/services/orderService", () => ({
  getOrderSummary: jest.fn(),
}));

const mockedGetOrderSummary = getOrderSummary as jest.MockedFunction<
  typeof getOrderSummary
>;

describe("useOrderSummary", () => {
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

  function renderUseOrderSummary(productId: number | undefined, xpToUse?: number) {
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    const rendered = renderHook(() => useOrderSummary(productId, xpToUse), {
      wrapper,
    });
    unmount = rendered.unmount;
    return rendered;
  }

  it("não chama o service e mantém data undefined sem productId", async () => {
    // Act
    const { result } = renderUseOrderSummary(undefined);

    // Assert
    await waitFor(() => expect(result.current.isPending).toBe(true));
    expect(mockedGetOrderSummary).not.toHaveBeenCalled();
    expect(result.current.data).toBeUndefined();
  });

  it("busca e retorna o resumo quando productId é informado", async () => {
    // Arrange
    mockedGetOrderSummary.mockResolvedValueOnce(orderSummary);

    // Act
    const { result } = renderUseOrderSummary(1);

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedGetOrderSummary).toHaveBeenCalledWith(1, undefined);
    expect(result.current.data).toEqual(orderSummary);
  });

  it("repassa o xpToUse para o service", async () => {
    // Arrange
    mockedGetOrderSummary.mockResolvedValueOnce(orderSummary);

    // Act
    const { result } = renderUseOrderSummary(1, 30);

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedGetOrderSummary).toHaveBeenCalledWith(1, 30);
  });

  it("expõe o erro quando o service falha", async () => {
    // Arrange
    const error = createAxiosError(500);
    mockedGetOrderSummary.mockRejectedValueOnce(error);

    // Act
    const { result } = renderUseOrderSummary(1);

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(error);
  });
});
