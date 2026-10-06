import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren } from "react";
import { useProductDetail } from "@/src/features/user/shop/hooks/products/useProductDetail";
import { getProductById } from "@/src/features/user/shop/services/productService";
import {
  productDetail,
  createAxiosError,
} from "@/src/features/user/shop/__tests__/fixtures/shop";

jest.mock("@/src/features/user/shop/services/productService", () => ({
  getProductById: jest.fn(),
}));

const mockedGetProductById = getProductById as jest.MockedFunction<typeof getProductById>;

describe("useProductDetail", () => {
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

  function renderUseProductDetail(id: number | undefined) {
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );

    const { unmount: unmountFn, ...rest } = renderHook(
      () => useProductDetail(id),
      { wrapper }
    );
    unmount = unmountFn;

    return rest;
  }

  it("não chama o service quando id é undefined (query desabilitada)", () => {
    // Act
    const { result } = renderUseProductDetail(undefined);

    // Assert
    expect(mockedGetProductById).not.toHaveBeenCalled();
    expect(result.current.data).toBeUndefined();
    expect(result.current.isPending).toBe(true);
  });

  it("retorna o detalhe do produto em caso de sucesso", async () => {
    // Arrange
    mockedGetProductById.mockResolvedValueOnce(productDetail);

    // Act
    const { result } = renderUseProductDetail(5);

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(productDetail);
    expect(client.getQueryState(["product", 5])?.status).toBe("success");
  });

  it("expõe o erro quando o service falha", async () => {
    // Arrange
    const error = createAxiosError(500);
    mockedGetProductById.mockRejectedValueOnce(error);

    // Act
    const { result } = renderUseProductDetail(5);

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(error);
  });
});
