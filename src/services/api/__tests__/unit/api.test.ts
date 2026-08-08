import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { api } from "@/src/services/api/api";
import { useAuthStore } from "@/src/stores/user/auth/authStore";
import { useShopkeeperAuthStore } from "@/src/stores/shopkeeper/auth/shopkeeperAuthStore";

type AuthConfig = { headers: Record<string, string>; _retry?: boolean };

type UnauthorizedError = {
  response: { status: number };
  config: AuthConfig;
};

type RequestInterceptor = (config: AuthConfig) => unknown;
type ResponseErrorInterceptor = (error: unknown) => Promise<unknown>;

jest.mock("@/src/stores/user/auth/authStore", () => ({
  useAuthStore: { getState: jest.fn() },
}));

jest.mock("@/src/stores/shopkeeper/auth/shopkeeperAuthStore", () => ({
  useShopkeeperAuthStore: { getState: jest.fn() },
}));

jest.mock("axios", () => {
  const requestHandlers: RequestInterceptor[] = [];
  const responseHandlers: { onRejected: ResponseErrorInterceptor }[] = [];

  const instance = jest.fn();
  (instance as unknown as Record<string, unknown>).interceptors = {
    request: {
      use: (handler: RequestInterceptor) => requestHandlers.push(handler),
    },
    response: {
      use: (_onFulfilled: unknown, onRejected: ResponseErrorInterceptor) =>
        responseHandlers.push({ onRejected }),
    },
  };

  const mockAxios = jest.fn();
  (mockAxios as unknown as Record<string, unknown>).create = jest.fn(
    () => instance
  );
  (mockAxios as unknown as Record<string, unknown>).get = jest.fn();
  (mockAxios as unknown as Record<string, unknown>).isAxiosError = jest.fn();
  (mockAxios as unknown as Record<string, unknown>).__requestHandlers =
    requestHandlers;
  (mockAxios as unknown as Record<string, unknown>).__responseHandlers =
    responseHandlers;

  return mockAxios;
});

const mockedSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;

const mockAxios = axios as unknown as {
  get: jest.Mock;
  create: jest.Mock;
  __requestHandlers: RequestInterceptor[];
  __responseHandlers: { onRejected: ResponseErrorInterceptor }[];
};

const mockedApi = api as unknown as jest.Mock;
const mockedRequestHandler = mockAxios.__requestHandlers[0];
const mockedResponseErrorHandler = mockAxios.__responseHandlers[0].onRejected;

const mockedAuthStoreGetState = useAuthStore.getState as jest.Mock;
const mockedShopkeeperAuthStoreGetState =
  useShopkeeperAuthStore.getState as jest.Mock;
const mockedSetAccessToken = jest.fn();
const mockedLogout = jest.fn();
const mockedShopkeeperSetAccessToken = jest.fn();
const mockedShopkeeperLogout = jest.fn();

let now = 1_000_000;

beforeEach(() => {
  jest.clearAllMocks();
  now += 60_000;
  jest.spyOn(Date, "now").mockReturnValue(now);

  mockedAuthStoreGetState.mockReturnValue({
    accessToken: null,
    setAccessToken: mockedSetAccessToken,
    logout: mockedLogout,
  });
  mockedShopkeeperAuthStoreGetState.mockReturnValue({
    accessToken: null,
    setAccessToken: mockedShopkeeperSetAccessToken,
    logout: mockedShopkeeperLogout,
  });

  mockedSecureStore.getItemAsync.mockImplementation((key) =>
    key === "refresh_token"
      ? Promise.resolve("refresh-token")
      : Promise.resolve(null)
  );
  mockedSecureStore.setItemAsync.mockResolvedValue(undefined);
  mockedSecureStore.deleteItemAsync.mockResolvedValue(undefined);
});

afterEach(() => {
  jest.restoreAllMocks();
});

function createUnauthorizedError(config: AuthConfig): UnauthorizedError {
  return { response: { status: 401 }, config };
}

describe("interceptors do api", () => {
  describe("request interceptor", () => {
    it("adiciona o token do turista no header quando ausente", () => {
      // Arrange
      mockedAuthStoreGetState.mockReturnValue({
        accessToken: "tourist-token",
        setAccessToken: mockedSetAccessToken,
        logout: mockedLogout,
      });
      const config: AuthConfig = { headers: {} };

      // Act
      const result = mockedRequestHandler(config);

      // Assert
      expect(config.headers.Authorization).toBe("Bearer tourist-token");
      expect(result).toBe(config);
    });

    it("não sobrescreve o Authorization já presente no header", () => {
      // Arrange
      const config: AuthConfig = {
        headers: { Authorization: "Bearer token-existente" },
      };

      // Act
      const result = mockedRequestHandler(config);

      // Assert
      expect(config.headers.Authorization).toBe("Bearer token-existente");
      expect(result).toBe(config);
      expect(mockedAuthStoreGetState).not.toHaveBeenCalled();
      expect(mockedShopkeeperAuthStoreGetState).not.toHaveBeenCalled();
    });
  });

  describe("response interceptor", () => {
    it("faz refresh no 401, salva o novo token e retenta a requisição original", async () => {
      // Arrange
      mockAxios.get.mockResolvedValueOnce({
        data: {
          access_token: "new-access-token",
          refresh_token: "new-refresh-token",
        },
      });
      mockedApi.mockResolvedValueOnce({ data: { ok: true } });
      const original: AuthConfig = { headers: {} };
      const error = createUnauthorizedError(original);

      // Act
      const result = await mockedResponseErrorHandler(error);

      // Assert
      expect(mockAxios.get).toHaveBeenCalledWith(
        expect.stringContaining("/auth/refresh"),
        { headers: { Authorization: "Bearer refresh-token" } }
      );
      expect(mockedSecureStore.setItemAsync).toHaveBeenCalledWith(
        "refresh_token",
        "new-refresh-token"
      );
      expect(mockedSetAccessToken).toHaveBeenCalledWith("new-access-token");
      expect(original.headers.Authorization).toBe("Bearer new-access-token");
      expect(mockedApi).toHaveBeenCalledWith(original);
      expect(result).toEqual({ data: { ok: true } });
    });

    it("faz logout e rejeita a requisição quando o refresh falha", async () => {
      // Arrange
      mockAxios.get.mockRejectedValueOnce(new Error("network"));
      const error = createUnauthorizedError({ headers: {} });

      // Act
      const result = mockedResponseErrorHandler(error);

      // Assert
      await expect(result).rejects.toBe(error);
      expect(mockedLogout).toHaveBeenCalled();
      expect(mockedShopkeeperLogout).not.toHaveBeenCalled();
      expect(mockedSetAccessToken).not.toHaveBeenCalled();
      expect(mockedApi).not.toHaveBeenCalled();
    });

    it("faz logout e rejeita com sessão expirada quando o 401 se repete", async () => {
      // Arrange
      const error = createUnauthorizedError({ headers: {}, _retry: true });

      // Act
      const result = mockedResponseErrorHandler(error);

      // Assert
      await expect(result).rejects.toThrow(
        "Sessão expirada, faça login novamente"
      );
      expect(mockedLogout).toHaveBeenCalled();
      expect(mockAxios.get).not.toHaveBeenCalled();
      expect(mockedApi).not.toHaveBeenCalled();
    });

    it("bloqueia refresh em intervalo menor que 5s (throttle) e faz logout", async () => {
      // Arrange
      mockAxios.get.mockResolvedValueOnce({
        data: { access_token: "first-token", refresh_token: "first-refresh" },
      });
      await mockedResponseErrorHandler(createUnauthorizedError({ headers: {} }));

      const secondError = createUnauthorizedError({ headers: {} });

      // Act
      const result = mockedResponseErrorHandler(secondError);

      // Assert
      await expect(result).rejects.toBe(secondError);
      expect(mockAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedSetAccessToken).toHaveBeenCalledTimes(1);
      expect(mockedLogout).toHaveBeenCalled();
    });
  });
});
