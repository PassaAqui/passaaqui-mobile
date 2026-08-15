import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren } from "react";
import { useDeleteProduct } from "@/src/features/shopkeeper/products/hooks/useDeleteProduct";
import { deleteProduct } from "@/src/features/shopkeeper/products/services/productService";
import { createAxiosError } from "@/src/features/shopkeeper/products/__tests__/fixtures/products";

jest.mock("@/src/features/shopkeeper/products/services/productService", () => ({
  deleteProduct: jest.fn(),
}));

const mockedDeleteProduct = deleteProduct as jest.MockedFunction<typeof deleteProduct>;

describe("useDeleteProduct", () => {
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

  function renderUseDeleteProduct() {
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    const { unmount: unmountFn, ...rest } = renderHook(() => useDeleteProduct(), {
      wrapper,
    });
    unmount = unmountFn;
    return rest;
  }

  it("resolve e invalida as queries de produtos após o sucesso", async () => {
    // Arrange
    client.setQueryData(["shopkeeper-products"], []);
    client.setQueryData(["shopkeeper-product-metrics"], {});
    mockedDeleteProduct.mockResolvedValueOnce(undefined);

    // Act
    const { result } = renderUseDeleteProduct();
    await result.current.mutateAsync(5);

    // Assert
    expect(mockedDeleteProduct).toHaveBeenCalledWith(5);
    expect(client.getQueryState(["shopkeeper-products"])?.isInvalidated).toBe(true);
    expect(client.getQueryState(["shopkeeper-product-metrics"])?.isInvalidated).toBe(true);
  });

  it("rejeita e expõe o erro quando o delete falha", async () => {
    // Arrange
    const error = createAxiosError(500);
    mockedDeleteProduct.mockRejectedValueOnce(error);

    // Act
    const { result } = renderUseDeleteProduct();
    const promise = result.current.mutateAsync(5);

    // Assert
    await expect(promise).rejects.toBe(error);
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
