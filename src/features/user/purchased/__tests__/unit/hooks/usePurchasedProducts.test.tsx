import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren } from "react";
import { usePurchasedProducts } from "@/src/features/user/purchased/hooks/usePurchasedProducts";
import { getPurchasedProducts } from "@/src/features/user/purchased/services/purchasedService";
import {
  purchasedProducts,
  createAxiosError,
} from "@/src/features/user/purchased/__tests__/fixtures/purchased";

jest.mock("@/src/features/user/purchased/services/purchasedService", () => ({
  getPurchasedProducts: jest.fn(),
}));

const mockedGetPurchasedProducts = getPurchasedProducts as jest.MockedFunction<
  typeof getPurchasedProducts
>;

describe("usePurchasedProducts", () => {
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

  function renderUsePurchasedProducts() {
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );

    const { unmount: unmountFn, ...rest } = renderHook(() => usePurchasedProducts(), {
      wrapper,
    });
    unmount = unmountFn;

    return rest;
  }

  it("retorna os produtos comprados em caso de sucesso", async () => {
    // Arrange
    mockedGetPurchasedProducts.mockResolvedValueOnce(purchasedProducts);

    // Act
    const { result } = renderUsePurchasedProducts();

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(purchasedProducts);
  });

  it("expõe o erro quando o service falha", async () => {
    // Arrange
    const error = createAxiosError(500);
    mockedGetPurchasedProducts.mockRejectedValueOnce(error);

    // Act
    const { result } = renderUsePurchasedProducts();

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(error);
  });

  it("grava os produtos no cache com a query key ['purchased-products']", async () => {
    // Arrange
    mockedGetPurchasedProducts.mockResolvedValueOnce(purchasedProducts);

    // Act
    renderUsePurchasedProducts();
    await waitFor(() => {
      expect(client.getQueryState(["purchased-products"])?.status).toBe("success");
    });

    // Assert
    expect(client.getQueryData(["purchased-products"])).toEqual(purchasedProducts);
  });
});
