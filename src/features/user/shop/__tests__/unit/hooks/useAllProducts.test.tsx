import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren } from "react";
import { useAllProducts } from "@/src/features/user/shop/hooks/products/useAllProducts";
import { getAllProducts } from "@/src/features/user/shop/services/productService";
import {
  products,
  createAxiosError,
} from "@/src/features/user/shop/__tests__/fixtures/shop";

jest.mock("@/src/features/user/shop/services/productService", () => ({
  getAllProducts: jest.fn(),
}));

const mockedGetAllProducts = getAllProducts as jest.MockedFunction<typeof getAllProducts>;

describe("useAllProducts", () => {
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

  function renderUseAllProducts() {
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );

    const { unmount: unmountFn, ...rest } = renderHook(() => useAllProducts(), {
      wrapper,
    });
    unmount = unmountFn;

    return rest;
  }

  it("retorna os produtos em caso de sucesso", async () => {
    // Arrange
    mockedGetAllProducts.mockResolvedValueOnce(products);

    // Act
    const { result } = renderUseAllProducts();

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(products);
  });

  it("expõe o erro quando o service falha", async () => {
    // Arrange
    const error = createAxiosError(500);
    mockedGetAllProducts.mockRejectedValueOnce(error);

    // Act
    const { result } = renderUseAllProducts();

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(error);
  });

  it("grava os produtos no cache com a query key ['products']", async () => {
    // Arrange
    mockedGetAllProducts.mockResolvedValueOnce(products);

    // Act
    renderUseAllProducts();
    await waitFor(() => {
      expect(client.getQueryState(["products"])?.status).toBe("success");
    });

    // Assert
    expect(client.getQueryData(["products"])).toEqual(products);
  });
});
