import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { api } from "@/src/services/api/api";
import { useAuthStore } from "@/src/stores/user/auth/authStore";
import { useVisitedCitiesStore } from "@/src/stores/user/map/visitedCitiesStore";
import {
  login,
  logout,
  singUp,
  tryRestoreSession,
} from "@/src/features/user/auth/services/authService";
import {
  BASE_URL,
  REFRESH_TOKEN_KEY,
  tokenResponse,
  validLoginInput,
  validSignUpInput,
  createAxiosError,
} from "@/src/features/user/auth/__tests__/fixtures/auth";

// Mock HTTP: `api` (client central) para as chamadas via `api.post`;
// `axios` direto para logout/refresh (caminho usado pelo authService).
jest.mock("expo-secure-store");
jest.mock("@/src/services/api/api", () => ({
  api: {
    post: jest.fn(),
  },
}));
jest.mock("axios");
jest.mock("@/src/stores/user/map/visitedCitiesStore", () => ({
  useVisitedCitiesStore: {
    getState: jest.fn(),
  },
}));

const mockedSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;
const mockedApi = api as jest.Mocked<typeof api>;
const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedVisitedCitiesReset = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, "log").mockImplementation(() => {});

  useAuthStore.setState({ accessToken: null });

  (useVisitedCitiesStore.getState as jest.Mock).mockReturnValue({
    reset: mockedVisitedCitiesReset,
  });

  mockedSecureStore.setItemAsync.mockResolvedValue(undefined);
  mockedSecureStore.getItemAsync.mockResolvedValue(null);
  mockedSecureStore.deleteItemAsync.mockResolvedValue(undefined);

  mockedAxios.get.mockReset();
  mockedAxios.isAxiosError.mockImplementation(
    (error: unknown) =>
      typeof error === "object" &&
      error !== null &&
      "isAxiosError" in error &&
      (error as { isAxiosError: boolean }).isAxiosError
  );
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("authService", () => {
  describe("login", () => {
    it("envia credenciais para /auth/login e persiste os tokens", async () => {
      // Arrange
      mockedApi.post.mockResolvedValueOnce({ data: tokenResponse });

      // Act
      await login(validLoginInput);

      // Assert
      expect(mockedApi.post).toHaveBeenCalledWith("/auth/login", validLoginInput);
      expect(useAuthStore.getState().accessToken).toBe(tokenResponse.access_token);
      expect(mockedSecureStore.setItemAsync).toHaveBeenCalledWith(
        REFRESH_TOKEN_KEY,
        tokenResponse.refresh_token
      );
    });
  });

  describe("singUp", () => {
    it("cadastra turista com documentId normalizado e faz login em seguida", async () => {
      // Arrange
      mockedApi.post
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce({ data: tokenResponse });

      // Act
      await singUp(validSignUpInput);

      // Assert
      expect(mockedApi.post).toHaveBeenNthCalledWith(1, "/auth/register/tourist", {
        email: validSignUpInput.email,
        name: validSignUpInput.name,
        password: validSignUpInput.password,
        confirm_password: validSignUpInput.confirm_password,
        documentId: "12345678900",
        cpf: undefined,
      });
      expect(mockedApi.post).toHaveBeenNthCalledWith(2, "/auth/login", {
        email: validSignUpInput.email,
        password: validSignUpInput.password,
      });
      expect(useAuthStore.getState().accessToken).toBe(tokenResponse.access_token);
      expect(mockedSecureStore.setItemAsync).toHaveBeenCalledWith(
        REFRESH_TOKEN_KEY,
        tokenResponse.refresh_token
      );
    });
  });

  describe("logout", () => {
    it("revoga sessão no backend quando há refresh token e limpa estado local", async () => {
      // Arrange
      mockedSecureStore.getItemAsync.mockResolvedValueOnce(tokenResponse.refresh_token);
      mockedAxios.get.mockResolvedValueOnce({ data: undefined });

      // Act
      await logout();

      // Assert
      expect(mockedAxios.get).toHaveBeenCalledWith(`${BASE_URL}/auth/logout`, {
        headers: { Authorization: `Bearer ${tokenResponse.refresh_token}` },
      });
      expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledWith(REFRESH_TOKEN_KEY);
      expect(mockedVisitedCitiesReset).toHaveBeenCalled();
      expect(useAuthStore.getState().accessToken).toBeNull();
    });

    it("limpa estado local mesmo sem refresh token no SecureStore", async () => {
      // Arrange
      mockedSecureStore.getItemAsync.mockResolvedValueOnce(null);

      // Act
      await logout();

      // Assert
      expect(mockedAxios.get).not.toHaveBeenCalled();
      expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledWith(REFRESH_TOKEN_KEY);
      expect(useAuthStore.getState().accessToken).toBeNull();
    });

    it("limpa estado local mesmo quando a revogação no backend falha", async () => {
      // Arrange
      mockedSecureStore.getItemAsync.mockResolvedValueOnce(tokenResponse.refresh_token);
      mockedAxios.get.mockRejectedValueOnce(new Error("network error"));

      // Act
      await logout();

      // Assert
      expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledWith(REFRESH_TOKEN_KEY);
      expect(useAuthStore.getState().accessToken).toBeNull();
    });
  });

  describe("tryRestoreSession", () => {
    it("retorna false quando não há refresh token salvo", async () => {
      // Arrange
      mockedSecureStore.getItemAsync.mockResolvedValueOnce(null);

      // Act
      const restored = await tryRestoreSession();

      // Assert
      expect(restored).toBe(false);
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it("renova tokens e retorna true quando o refresh é bem-sucedido", async () => {
      // Arrange
      const newTokens = {
        access_token: "new-access-token",
        refresh_token: "new-refresh-token",
      };
      mockedSecureStore.getItemAsync.mockResolvedValueOnce(tokenResponse.refresh_token);
      mockedAxios.get.mockResolvedValueOnce({ data: newTokens });

      // Act
      const restored = await tryRestoreSession();

      // Assert
      expect(mockedAxios.get).toHaveBeenCalledWith(`${BASE_URL}/auth/refresh`, {
        headers: { Authorization: `Bearer ${tokenResponse.refresh_token}` },
      });
      expect(useAuthStore.getState().accessToken).toBe(newTokens.access_token);
      expect(mockedSecureStore.setItemAsync).toHaveBeenCalledWith(
        REFRESH_TOKEN_KEY,
        newTokens.refresh_token
      );
      expect(restored).toBe(true);
    });

    it("retorna false e faz logout quando o refresh retorna 400", async () => {
      // Arrange
      mockedSecureStore.getItemAsync
        .mockResolvedValueOnce(tokenResponse.refresh_token)
        .mockResolvedValueOnce(tokenResponse.refresh_token);
      mockedAxios.get
        .mockRejectedValueOnce(createAxiosError(400))
        .mockResolvedValueOnce({ data: undefined });

      // Act
      const restored = await tryRestoreSession();

      // Assert
      expect(restored).toBe(false);
      expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledWith(REFRESH_TOKEN_KEY);
      expect(useAuthStore.getState().accessToken).toBeNull();
    });

    it("retorna false e faz logout quando o refresh retorna 401", async () => {
      // Arrange
      mockedSecureStore.getItemAsync
        .mockResolvedValueOnce(tokenResponse.refresh_token)
        .mockResolvedValueOnce(tokenResponse.refresh_token);
      mockedAxios.get
        .mockRejectedValueOnce(createAxiosError(401))
        .mockResolvedValueOnce({ data: undefined });

      // Act
      const restored = await tryRestoreSession();

      // Assert
      expect(restored).toBe(false);
      expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledWith(REFRESH_TOKEN_KEY);
      expect(useAuthStore.getState().accessToken).toBeNull();
    });

    it("retorna false sem logout quando o refresh falha com outro erro", async () => {
      // Arrange
      mockedSecureStore.getItemAsync.mockResolvedValueOnce(tokenResponse.refresh_token);
      mockedAxios.get.mockRejectedValueOnce(createAxiosError(404));
      useAuthStore.setState({ accessToken: "token-existente" });

      // Act
      const restored = await tryRestoreSession();

      // Assert
      expect(restored).toBe(false);
      expect(mockedSecureStore.deleteItemAsync).not.toHaveBeenCalled();
      expect(useAuthStore.getState().accessToken).toBe("token-existente");
    });
  });
});
