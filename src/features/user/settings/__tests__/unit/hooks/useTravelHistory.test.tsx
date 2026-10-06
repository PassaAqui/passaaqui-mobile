import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren } from "react";
import { useTravelHistory } from "@/src/features/user/settings/hooks/useTravelHistory";
import { getTravelHistory } from "@/src/features/user/settings/services/travelHistoryService";
import {
  travelHistory,
  createAxiosError,
} from "@/src/features/user/settings/__tests__/fixtures/travelHistory";

jest.mock("@/src/features/user/settings/services/travelHistoryService", () => ({
  getTravelHistory: jest.fn(),
}));

const mockedGetTravelHistory = getTravelHistory as jest.MockedFunction<
  typeof getTravelHistory
>;

describe("useTravelHistory", () => {
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

  function renderUseTravelHistory() {
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );

    const { unmount: unmountFn, ...rest } = renderHook(() => useTravelHistory(), {
      wrapper,
    });
    unmount = unmountFn;

    return rest;
  }

  it("retorna o histórico em caso de sucesso", async () => {
    // Arrange
    mockedGetTravelHistory.mockResolvedValueOnce(travelHistory);

    // Act
    const { result } = renderUseTravelHistory();

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(travelHistory);
  });

  it("expõe o erro quando o service falha", async () => {
    // Arrange
    const error = createAxiosError(401);
    mockedGetTravelHistory.mockRejectedValueOnce(error);

    // Act
    const { result } = renderUseTravelHistory();

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(error);
  });

  it("grava o histórico no cache com a query key ['travel-history']", async () => {
    // Arrange
    mockedGetTravelHistory.mockResolvedValueOnce(travelHistory);

    // Act
    renderUseTravelHistory();
    await waitFor(() => {
      expect(client.getQueryState(["travel-history"])?.status).toBe("success");
    });

    // Assert
    expect(client.getQueryData(["travel-history"])).toEqual(travelHistory);
  });
});