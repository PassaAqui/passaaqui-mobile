import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren } from "react";
import { useCreateReview } from "@/src/features/user/purchased/hooks/useCreateReview";
import { createProductReview } from "@/src/features/user/purchased/services/reviewService";
import {
  photo,
  review,
  video,
  createAxiosError,
} from "@/src/features/user/purchased/__tests__/fixtures/review";

jest.mock("@/src/features/user/purchased/services/reviewService", () => ({
  createProductReview: jest.fn(),
}));

const mockedCreateProductReview = createProductReview as jest.MockedFunction<
  typeof createProductReview
>;

describe("useCreateReview", () => {
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

  function renderUseCreateReview() {
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );

    const { unmount: unmountFn, ...rest } = renderHook(() => useCreateReview(), {
      wrapper,
    });
    unmount = unmountFn;

    return rest;
  }

  const payload = {
    productId: "#A3F92",
    rating: 5,
    comment: "Muito boa!",
    photos: [photo],
    videos: [video],
  };

  it("cria a avaliação em caso de sucesso", async () => {
    // Arrange
    mockedCreateProductReview.mockResolvedValueOnce(review);

    // Act
    const { result } = renderUseCreateReview();
    result.current.mutate(payload);

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedCreateProductReview).toHaveBeenCalledWith(payload);
    expect(result.current.data).toEqual(review);
  });

  it("expõe o erro quando o service falha", async () => {
    // Arrange
    const error = createAxiosError(400);
    mockedCreateProductReview.mockRejectedValueOnce(error);

    // Act
    const { result } = renderUseCreateReview();
    result.current.mutate(payload);

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(error);
  });

  it("invalida as queries de produto, listagens e comprados no sucesso", async () => {
    // Arrange
    mockedCreateProductReview.mockResolvedValueOnce(review);
    const invalidateSpy = jest.spyOn(client, "invalidateQueries");

    // Act
    const { result } = renderUseCreateReview();
    result.current.mutate(payload);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    const expectedKeys = [
      ["product"],
      ["products"],
      ["poi-products"],
      ["category-products"],
      ["purchased-products"],
    ];
    for (const key of expectedKeys) {
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: key });
    }
  });
});