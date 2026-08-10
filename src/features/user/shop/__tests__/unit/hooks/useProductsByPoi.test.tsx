import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren } from "react";
import { useProductsByPoi } from "@/src/features/user/shop/hooks/products/useProductsByPoi";
import { getPoiById } from "@/src/features/user/map/poi/services/poiService";
import { poiDetail } from "@/src/features/user/map/__tests__/fixtures/map";
import { createAxiosError } from "@/src/features/user/shop/__tests__/fixtures/shop";

jest.mock("@/src/features/user/map/poi/services/poiService", () => ({
  getPoiById: jest.fn(),
}));

const mockedGetPoiById = getPoiById as jest.MockedFunction<typeof getPoiById>;

describe("useProductsByPoi", () => {
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

  function renderUseProductsByPoi(poiId: number | undefined) {
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );

    const { unmount: unmountFn, ...rest } = renderHook(() => useProductsByPoi(poiId), {
      wrapper,
    });
    unmount = unmountFn;

    return rest;
  }

  it("não chama o service quando poiId é undefined (query desabilitada)", () => {
    // Act
    const { result } = renderUseProductsByPoi(undefined);

    // Assert
    expect(mockedGetPoiById).not.toHaveBeenCalled();
    expect(result.current.data).toBeUndefined();
    expect(result.current.isPending).toBe(true);
  });

  it("retorna os produtos do POI em caso de sucesso", async () => {
    // Arrange
    mockedGetPoiById.mockResolvedValueOnce(poiDetail);

    // Act
    const { result } = renderUseProductsByPoi(7);

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(poiDetail);
    expect(result.current.data?.products).toHaveLength(poiDetail.products.length);
    expect(client.getQueryState(["poi-products", 7])?.status).toBe("success");
  });

  it("expõe o erro quando o service falha", async () => {
    // Arrange
    const error = createAxiosError(500);
    mockedGetPoiById.mockRejectedValueOnce(error);

    // Act
    const { result } = renderUseProductsByPoi(7);

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(error);
  });
});
