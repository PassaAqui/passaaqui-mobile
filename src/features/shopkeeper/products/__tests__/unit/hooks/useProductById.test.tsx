import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren } from "react";
import { useProductById } from "@/src/features/shopkeeper/products/hooks/useProductById";
import { getProductById } from "@/src/features/shopkeeper/products/services/productService";
import {
  productModel,
  createAxiosError,
} from "@/src/features/shopkeeper/products/__tests__/fixtures/products";

jest.mock("@/src/features/shopkeeper/products/services/productService", () => ({
  getProductById: jest.fn(),
}));

const mockedGetProductById = getProductById as jest.MockedFunction<typeof getProductById>;

describe("useProductById", () => {
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

  function renderUseProductById(id: number) {
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    const { unmount: unmountFn, ...rest } = renderHook(() => useProductById(id), {
      wrapper,
    });
    unmount = unmountFn;
    return rest;
  }

  it("com id falsy (0) a query fica desabilitada e não busca", async () => {
    // Arrange

    // Act
    const { result } = renderUseProductById(0);

    // Assert
    await waitFor(() => expect(result.current.isPending).toBe(true));
    expect(mockedGetProductById).not.toHaveBeenCalled();
    expect(result.current.data).toBeUndefined();
  });

  it("com id busca o produto e registra a query", async () => {
    // Arrange
    mockedGetProductById.mockResolvedValueOnce(productModel);

    // Act
    const { result } = renderUseProductById(5);

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(productModel);
    expect(mockedGetProductById).toHaveBeenCalledWith(5);
    expect(client.getQueryState(["product", 5])?.status).toBe("success");
  });

  it("expõe o erro quando a busca falha", async () => {
    // Arrange
    const error = createAxiosError(500);
    mockedGetProductById.mockRejectedValueOnce(error);

    // Act
    const { result } = renderUseProductById(5);

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(error);
  });
});
