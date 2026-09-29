import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren } from "react";
import { useProductRatings } from "@/src/features/user/shop/hooks/products/useProductRatings";
import { getProductRatings } from "@/src/features/user/shop/services/ratingService";
import {
  productRating,
  createAxiosError,
} from "@/src/features/user/shop/__tests__/fixtures/productRatings";

jest.mock("@/src/features/user/shop/services/ratingService", () => ({
  getProductRatings: jest.fn(),
}));

const mockedGetProductRatings = getProductRatings as jest.MockedFunction<
  typeof getProductRatings
>;

describe("useProductRatings", () => {
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

  function renderUseProductRatings() {
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );

    const { unmount: unmountFn, ...rest } = renderHook(() => useProductRatings(10), {
      wrapper,
    });
    unmount = unmountFn;

    return rest;
  }

  it("retorna as avaliações em caso de sucesso", async () => {
    // Arrange
    mockedGetProductRatings.mockResolvedValueOnce([productRating]);

    // Act
    const { result } = renderUseProductRatings();

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedGetProductRatings).toHaveBeenCalledWith(10);
    expect(result.current.data).toEqual([productRating]);
  });

  it("expõe o erro quando o service falha", async () => {
    // Arrange
    const error = createAxiosError(404);
    mockedGetProductRatings.mockRejectedValueOnce(error);

    // Act
    const { result } = renderUseProductRatings();

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(error);
  });

  it("grava as avaliações no cache com a query key ['product-ratings', id]", async () => {
    // Arrange
    mockedGetProductRatings.mockResolvedValueOnce([productRating]);

    // Act
    renderUseProductRatings();
    await waitFor(() => {
      expect(client.getQueryState(["product-ratings", 10])?.status).toBe("success");
    });

    // Assert
    expect(client.getQueryData(["product-ratings", 10])).toEqual([productRating]);
  });
});