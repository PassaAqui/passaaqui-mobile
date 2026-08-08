import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren } from "react";
import { useTouristMe } from "@/src/features/user/auth/hooks/useTouristMe";
import {
  getTouristMe,
  TouristProfile,
} from "@/src/features/user/auth/services/touristService";
import { createAxiosError } from "@/src/features/user/auth/__tests__/fixtures/auth";

jest.mock("@/src/features/user/auth/services/touristService", () => ({
  getTouristMe: jest.fn(),
}));

const mockedGetTouristMe = getTouristMe as jest.MockedFunction<typeof getTouristMe>;

const validTouristProfile: TouristProfile = {
  id: 1,
  name: "Turista Teste",
  currentXP: 120,
};

describe("useTouristMe", () => {
  let client: QueryClient;
  let unmount: () => void;

  beforeEach(() => {
    jest.clearAllMocks();
    client = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
  });

  afterEach(() => {
    unmount?.();
    client.clear();
  });

  function renderUseTouristMe() {
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );

    const { unmount: unmountFn, ...rest } = renderHook(() => useTouristMe(), { wrapper });
    unmount = unmountFn;

    return rest;
  }

  it("retorna o perfil do turista em caso de sucesso", async () => {
    // Arrange
    mockedGetTouristMe.mockResolvedValueOnce(validTouristProfile);

    // Act
    const { result } = renderUseTouristMe();

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(validTouristProfile);
  });

  it("expõe o erro quando o service falha", async () => {
    // Arrange
    const error = createAxiosError(500);
    mockedGetTouristMe.mockRejectedValueOnce(error);

    // Act
    const { result } = renderUseTouristMe();

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(error);
  });
});