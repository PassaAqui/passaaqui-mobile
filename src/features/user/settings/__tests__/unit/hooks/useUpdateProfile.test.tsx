import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren } from "react";
import { useUpdateProfile } from "@/src/features/user/settings/hooks/useUpdateProfile";
import { updateTouristProfile } from "@/src/features/user/settings/services/profileService";
import { createAxiosError } from "@/src/features/user/auth/__tests__/fixtures/auth";

jest.mock("@/src/features/user/settings/services/profileService", () => ({
  updateTouristProfile: jest.fn(),
}));

const mockedUpdateTouristProfile = updateTouristProfile as jest.MockedFunction<
  typeof updateTouristProfile
>;

const updatedProfile = {
  id: 1,
  email: "turista@email.com",
  name: "João Atualizado",
  role: "TOURIST",
  theme: "LIGHT" as const,
  image: "http://localhost:9000/passaaqui-bucket/users/avatar-2.jpg",
  imageUrl: "http://localhost:9000/passaaqui-bucket/users/avatar-2.jpg",
  createdAt: "2026-05-24T10:00:00",
  updatedAt: "2026-05-24T12:00:00",
  deviceId: null,
  documentId: "12345678909",
  lastKnownLocation: null,
  currentXP: 0,
  level: 0,
};

describe("useUpdateProfile", () => {
  let client: QueryClient;
  let unmount: () => void;

  beforeEach(() => {
    jest.clearAllMocks();
    client = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { gcTime: 0 } },
    });
  });

  afterEach(() => {
    unmount?.();
    client.clear();
  });

  function renderUseUpdateProfile() {
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );

    const { unmount: unmountFn, ...rest } = renderHook(() => useUpdateProfile(), { wrapper });
    unmount = unmountFn;

    return rest;
  }

  it("atualiza o perfil com sucesso", async () => {
    // Arrange
    mockedUpdateTouristProfile.mockResolvedValueOnce(updatedProfile);

    // Act
    const { result } = renderUseUpdateProfile();
    result.current.mutate({ payload: { name: "João Atualizado" } });

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(updatedProfile);
  });

  it("envia o payload e a imagem para o service", async () => {
    // Arrange
    mockedUpdateTouristProfile.mockResolvedValueOnce(updatedProfile);

    // Act
    const { result } = renderUseUpdateProfile();
    result.current.mutate({
      payload: { name: "João Atualizado" },
      imageUri: "file:///avatar.jpg",
    });

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedUpdateTouristProfile).toHaveBeenCalledWith(
      { name: "João Atualizado" },
      "file:///avatar.jpg"
    );
  });

  it("expõe o erro quando o service falha", async () => {
    // Arrange
    const error = createAxiosError(400);
    mockedUpdateTouristProfile.mockRejectedValueOnce(error);

    // Act
    const { result } = renderUseUpdateProfile();
    result.current.mutate({ payload: { name: "João Atualizado" } });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(error);
  });

  it("atualiza o cache da query ['tourist-me'] com a resposta do PUT", async () => {
    // Arrange
    mockedUpdateTouristProfile.mockResolvedValueOnce(updatedProfile);

    // Act
    const { result } = renderUseUpdateProfile();
    result.current.mutate({ payload: { name: "João Atualizado" } });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(client.getQueryData(["tourist-me"])).toEqual(updatedProfile);
  });

  it("não altera o cache quando a mutation falha", async () => {
    // Arrange
    mockedUpdateTouristProfile.mockRejectedValueOnce(createAxiosError(400));
    client.setQueryData(["tourist-me"], { id: 1, name: "João" });

    // Act
    const { result } = renderUseUpdateProfile();
    result.current.mutate({ payload: { name: "João Atualizado" } });
    await waitFor(() => expect(result.current.isError).toBe(true));

    // Assert
    expect(client.getQueryData(["tourist-me"])).toEqual({ id: 1, name: "João" });
  });
});
