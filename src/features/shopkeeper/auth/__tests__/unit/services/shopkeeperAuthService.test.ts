import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { api } from "@/src/services/api/api";
import { useShopkeeperAuthStore } from "@/src/stores/shopkeeper/auth/shopkeeperAuthStore";
import {
  loginShopkeeper,
  logoutShopkeeper,
  signUpShopkeeper,
  tryRestoreShopkeeperSession,
} from "@/src/features/shopkeeper/auth/services/shopkeeperAuthService";
import {
  BASE_URL,
  SHOPKEEPER_REFRESH_TOKEN_KEY,
  shopkeeperLoginInput,
  shopkeeperTokens,
  createAxiosError,
} from "@/src/features/shopkeeper/auth/__tests__/fixtures/shopkeeper";

// Mock HTTP: `api` (client central) para as chamadas via `api.post`;
// `axios` direto para logout/refresh (caminho usado pelo shopkeeperAuthService).
jest.mock("expo-secure-store");
jest.mock("@/src/services/api/api", () => ({
  api: {
    post: jest.fn(),
  },
}));
jest.mock("axios");

const mockedSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;
const mockedApi = api as jest.Mocked<typeof api>;
const mockedAxios = axios as jest.Mocked<typeof axios>;

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, "log").mockImplementation(() => {});

  useShopkeeperAuthStore.setState({ accessToken: null });

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

describe("shopkeeperAuthService", () => {
  describe("signUpShopkeeper", () => {
    it("envia FormData para /auth/register/shopkeeper com header multipart", async () => {
      // Arrange
      const formData = new FormData();
      mockedApi.post.mockResolvedValueOnce(undefined);

      // Act
      await signUpShopkeeper(formData);

      // Assert
      expect(mockedApi.post).toHaveBeenCalledWith(
        "/auth/register/shopkeeper",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
    });

    it("rejeita quando o registro falha com erro HTTP", async () => {
      // Arrange
      const error = createAxiosError(500);
      mockedApi.post.mockRejectedValueOnce(error);

      // Act
      const result = signUpShopkeeper(new FormData());

      // Assert
      await expect(result).rejects.toBe(error);
    });
  });

  describe("loginShopkeeper", () => {
    it("envia credenciais para /auth/login e persiste os tokens", async () => {
      // Arrange
      mockedApi.post.mockResolvedValueOnce({ data: shopkeeperTokens });

      // Act
      await loginShopkeeper(shopkeeperLoginInput);

      // Assert
      expect(mockedApi.post).toHaveBeenCalledWith("/auth/login", shopkeeperLoginInput);
      expect(useShopkeeperAuthStore.getState().accessToken).toBe(
        shopkeeperTokens.access_token
      );
      expect(mockedSecureStore.setItemAsync).toHaveBeenCalledWith(
        SHOPKEEPER_REFRESH_TOKEN_KEY,
        shopkeeperTokens.refresh_token
      );
    });
  });

  describe("logoutShopkeeper", () => {
    it("revoga sessão no backend quando há refresh token e limpa estado local", async () => {
      // Arrange
      mockedSecureStore.getItemAsync.mockResolvedValueOnce(
        shopkeeperTokens.refresh_token
      );
      mockedAxios.get.mockResolvedValueOnce({ data: undefined });

      // Act
      await logoutShopkeeper();

      // Assert
      expect(mockedAxios.get).toHaveBeenCalledWith(`${BASE_URL}/auth/logout`, {
        headers: { Authorization: `Bearer ${shopkeeperTokens.refresh_token}` },
      });
      expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledWith(
        SHOPKEEPER_REFRESH_TOKEN_KEY
      );
      expect(useShopkeeperAuthStore.getState().accessToken).toBeNull();
    });

    it("limpa estado local mesmo sem refresh token no SecureStore", async () => {
      // Arrange
      mockedSecureStore.getItemAsync.mockResolvedValueOnce(null);

      // Act
      await logoutShopkeeper();

      // Assert
      expect(mockedAxios.get).not.toHaveBeenCalled();
      expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledWith(
        SHOPKEEPER_REFRESH_TOKEN_KEY
      );
      expect(useShopkeeperAuthStore.getState().accessToken).toBeNull();
    });

    it("limpa estado local mesmo quando a revogação no backend falha", async () => {
      // Arrange
      mockedSecureStore.getItemAsync.mockResolvedValueOnce(
        shopkeeperTokens.refresh_token
      );
      mockedAxios.get.mockRejectedValueOnce(new Error("network error"));

      // Act
      await logoutShopkeeper();

      // Assert
      expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledWith(
        SHOPKEEPER_REFRESH_TOKEN_KEY
      );
      expect(useShopkeeperAuthStore.getState().accessToken).toBeNull();
    });
  });

  describe("tryRestoreShopkeeperSession", () => {
    it("retorna false quando não há refresh token salvo", async () => {
      // Arrange
      mockedSecureStore.getItemAsync.mockResolvedValueOnce(null);

      // Act
      const restored = await tryRestoreShopkeeperSession();

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
      mockedSecureStore.getItemAsync.mockResolvedValueOnce(
        shopkeeperTokens.refresh_token
      );
      mockedAxios.get.mockResolvedValueOnce({ data: newTokens });

      // Act
      const restored = await tryRestoreShopkeeperSession();

      // Assert
      expect(mockedAxios.get).toHaveBeenCalledWith(`${BASE_URL}/auth/refresh`, {
        headers: { Authorization: `Bearer ${shopkeeperTokens.refresh_token}` },
      });
      expect(useShopkeeperAuthStore.getState().accessToken).toBe(
        newTokens.access_token
      );
      expect(mockedSecureStore.setItemAsync).toHaveBeenCalledWith(
        SHOPKEEPER_REFRESH_TOKEN_KEY,
        newTokens.refresh_token
      );
      expect(restored).toBe(true);
    });

    it("retorna false e faz logout quando o refresh retorna 400", async () => {
      // Arrange
      mockedSecureStore.getItemAsync.mockResolvedValueOnce(
        shopkeeperTokens.refresh_token
      );
      mockedAxios.get.mockRejectedValueOnce(createAxiosError(400));

      // Act
      const restored = await tryRestoreShopkeeperSession();

      // Assert
      expect(restored).toBe(false);
      expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledWith(
        SHOPKEEPER_REFRESH_TOKEN_KEY
      );
      expect(useShopkeeperAuthStore.getState().accessToken).toBeNull();
    });

    it("retorna false e faz logout quando o refresh retorna 401", async () => {
      // Arrange
      mockedSecureStore.getItemAsync.mockResolvedValueOnce(
        shopkeeperTokens.refresh_token
      );
      mockedAxios.get.mockRejectedValueOnce(createAxiosError(401));

      // Act
      const restored = await tryRestoreShopkeeperSession();

      // Assert
      expect(restored).toBe(false);
      expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledWith(
        SHOPKEEPER_REFRESH_TOKEN_KEY
      );
      expect(useShopkeeperAuthStore.getState().accessToken).toBeNull();
    });

    it("retorna false sem logout quando o refresh falha com outro erro", async () => {
      // Arrange
      mockedSecureStore.getItemAsync.mockResolvedValueOnce(
        shopkeeperTokens.refresh_token
      );
      mockedAxios.get.mockRejectedValueOnce(createAxiosError(404));
      useShopkeeperAuthStore.setState({ accessToken: "token-existente" });

      // Act
      const restored = await tryRestoreShopkeeperSession();

      // Assert
      expect(restored).toBe(false);
      expect(mockedSecureStore.deleteItemAsync).not.toHaveBeenCalled();
      expect(useShopkeeperAuthStore.getState().accessToken).toBe(
        "token-existente"
      );
    });
  });
});