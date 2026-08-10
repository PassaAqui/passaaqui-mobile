import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren } from "react";
import { useCategoryProducts } from "@/src/features/user/shop/hooks/categories/useCategoryProducts";
import { getCategoryById } from "@/src/features/category/services/categoryService";
import {
  categoryProducts,
  createAxiosError,
} from "@/src/features/user/shop/__tests__/fixtures/shop";

jest.mock("@/src/features/category/services/categoryService", () => ({
  getCategoryById: jest.fn(),
}));

const mockedGetCategoryById = getCategoryById as jest.MockedFunction<typeof getCategoryById>;

describe("useCategoryProducts", () => {
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

  function renderUseCategoryProducts(categoryId: number | undefined) {
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );

    const { unmount: unmountFn, ...rest } = renderHook(
      () => useCategoryProducts(categoryId),
      { wrapper }
    );
    unmount = unmountFn;

    return rest;
  }

  it("não chama o service quando categoryId é undefined (query desabilitada)", () => {
    // Act
    const { result } = renderUseCategoryProducts(undefined);

    // Assert
    expect(mockedGetCategoryById).not.toHaveBeenCalled();
    expect(result.current.data).toBeUndefined();
    expect(result.current.isPending).toBe(true);
  });

  it("retorna os produtos da categoria em caso de sucesso", async () => {
    // Arrange
    mockedGetCategoryById.mockResolvedValueOnce(categoryProducts);

    // Act
    const { result } = renderUseCategoryProducts(3);

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(categoryProducts);
    expect(result.current.data?.products.content).toHaveLength(1);
    expect(client.getQueryState(["category-products", 3])?.status).toBe("success");
  });

  it("expõe o erro quando o service falha", async () => {
    // Arrange
    const error = createAxiosError(500);
    mockedGetCategoryById.mockRejectedValueOnce(error);

    // Act
    const { result } = renderUseCategoryProducts(3);

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(error);
  });
});
