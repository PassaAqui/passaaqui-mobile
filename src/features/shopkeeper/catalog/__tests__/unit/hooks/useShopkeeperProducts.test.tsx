import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren } from "react";
import { useShopkeeperProducts } from "@/src/features/shopkeeper/catalog/hooks/useShopkeeperProducts";
import { getShopkeeperProducts } from "@/src/features/shopkeeper/catalog/services/shopkeeperProductsService";
import { shopkeeperProducts } from "@/src/features/shopkeeper/catalog/__tests__/fixtures/catalog";
import { createAxiosError } from "@/src/features/shopkeeper/auth/__tests__/fixtures/shopkeeper";

jest.mock(
  "@/src/features/shopkeeper/catalog/services/shopkeeperProductsService",
  () => ({
    getShopkeeperProducts: jest.fn(),
  })
);

const mockedGetShopkeeperProducts = getShopkeeperProducts as jest.MockedFunction<
  typeof getShopkeeperProducts
>;

describe("useShopkeeperProducts", () => {
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

  function renderUseShopkeeperProducts(inStock?: boolean) {
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );

    const { unmount: unmountFn, ...rest } = renderHook(
      () => useShopkeeperProducts(inStock),
      { wrapper }
    );
    unmount = unmountFn;

    return rest;
  }

  it("retorna os produtos em caso de sucesso sem inStock", async () => {
    // Arrange
    mockedGetShopkeeperProducts.mockResolvedValueOnce(shopkeeperProducts);

    // Act
    const { result } = renderUseShopkeeperProducts();

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(shopkeeperProducts);
    expect(mockedGetShopkeeperProducts).toHaveBeenCalledWith({
      inStock: undefined,
    });
    expect(
      client.getQueryState(["shopkeeper-products", { inStock: undefined }])
        ?.status
    ).toBe("success");
  });

  it("consulta com inStock true e registra a query correspondente", async () => {
    // Arrange
    mockedGetShopkeeperProducts.mockResolvedValueOnce(shopkeeperProducts);

    // Act
    const { result } = renderUseShopkeeperProducts(true);

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedGetShopkeeperProducts).toHaveBeenCalledWith({
      inStock: true,
    });
    expect(
      client.getQueryState(["shopkeeper-products", { inStock: true }])
        ?.status
    ).toBe("success");
  });

  it("expõe o erro quando o service falha", async () => {
    // Arrange
    const error = createAxiosError(500);
    mockedGetShopkeeperProducts.mockRejectedValueOnce(error);

    // Act
    const { result } = renderUseShopkeeperProducts();

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(error);
  });
});