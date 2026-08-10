import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren } from "react";
import { useAllCategories } from "@/src/features/category/hooks/useAllCategories";
import { getAllCategories } from "@/src/features/category/services/categoryService";
import {
  categories,
  createAxiosError,
} from "@/src/features/category/__tests__/fixtures/category";

jest.mock("@/src/features/category/services/categoryService", () => ({
  getAllCategories: jest.fn(),
}));

const mockedGetAllCategories =
  getAllCategories as jest.MockedFunction<typeof getAllCategories>;

describe("useAllCategories", () => {
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

  function renderUseAllCategories() {
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );

    const { unmount: unmountFn, ...rest } = renderHook(() => useAllCategories(), {
      wrapper,
    });
    unmount = unmountFn;

    return rest;
  }

  it("retorna as categorias em caso de sucesso", async () => {
    // Arrange
    mockedGetAllCategories.mockResolvedValueOnce(categories);

    // Act
    const { result } = renderUseAllCategories();

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(categories);
  });

  it("expõe o erro quando o service falha", async () => {
    // Arrange
    const error = createAxiosError(500);
    mockedGetAllCategories.mockRejectedValueOnce(error);

    // Act
    const { result } = renderUseAllCategories();

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(error);
  });

  it("grava as categorias no cache com a query key ['categories']", async () => {
    // Arrange
    mockedGetAllCategories.mockResolvedValueOnce(categories);

    // Act
    renderUseAllCategories();
    await waitFor(() => {
      expect(client.getQueryState(["categories"])?.status).toBe("success");
    });

    // Assert
    expect(client.getQueryData(["categories"])).toEqual(categories);
  });
});