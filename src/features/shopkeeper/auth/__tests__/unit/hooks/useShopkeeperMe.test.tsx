import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren } from "react";
import { useShopkeeperMe } from "@/src/features/shopkeeper/auth/hooks/useShopkeeperMe";
import { getShopkeeperMe } from "@/src/features/shopkeeper/auth/services/shopkeeperService";
import {
  createAxiosError,
  shopkeeperMe,
} from "@/src/features/shopkeeper/auth/__tests__/fixtures/shopkeeper";

jest.mock("@/src/features/shopkeeper/auth/services/shopkeeperService", () => ({
  getShopkeeperMe: jest.fn(),
}));

const mockedGetShopkeeperMe =
  getShopkeeperMe as jest.MockedFunction<typeof getShopkeeperMe>;

describe("useShopkeeperMe", () => {
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

  function renderUseShopkeeperMe() {
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );

    const { unmount: unmountFn, ...rest } = renderHook(() => useShopkeeperMe(), {
      wrapper,
    });
    unmount = unmountFn;

    return rest;
  }

  it("retorna o perfil do lojista em caso de sucesso e registra a query", async () => {
    // Arrange
    mockedGetShopkeeperMe.mockResolvedValueOnce(shopkeeperMe);

    // Act
    const { result } = renderUseShopkeeperMe();

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(shopkeeperMe);
    expect(client.getQueryState(["shopkeeper-me"])?.status).toBe("success");
  });

  it("expõe o erro quando o service falha", async () => {
    // Arrange
    const error = createAxiosError(500);
    mockedGetShopkeeperMe.mockRejectedValueOnce(error);

    // Act
    const { result } = renderUseShopkeeperMe();

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(error);
  });
});