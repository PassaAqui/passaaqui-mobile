import * as SecureStore from "expo-secure-store";
import { useShopkeeperAuthStore } from "@/src/stores/shopkeeper/auth/shopkeeperAuthStore";
import { SHOPKEEPER_REFRESH_TOKEN_KEY } from "@/src/features/shopkeeper/auth/__tests__/fixtures/shopkeeper";

const mockedSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;

beforeEach(() => {
  jest.clearAllMocks();
  useShopkeeperAuthStore.setState({ accessToken: null });
  mockedSecureStore.deleteItemAsync.mockResolvedValue(undefined);
});

describe("shopkeeperAuthStore", () => {
  describe("setAccessToken", () => {
    it("atualiza o accessToken no estado", () => {
      // Act
      useShopkeeperAuthStore.getState().setAccessToken("token-novo");

      // Assert
      expect(useShopkeeperAuthStore.getState().accessToken).toBe("token-novo");
    });
  });

  describe("logout", () => {
    it("remove o refresh token do SecureStore e volta accessToken a null", async () => {
      // Arrange
      useShopkeeperAuthStore.setState({ accessToken: "token-existente" });

      // Act
      await useShopkeeperAuthStore.getState().logout();

      // Assert
      expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledWith(
        SHOPKEEPER_REFRESH_TOKEN_KEY
      );
      expect(useShopkeeperAuthStore.getState().accessToken).toBeNull();
    });

    it("mantém accessToken null e continua removendo quando não há token", async () => {
      // Act
      await useShopkeeperAuthStore.getState().logout();

      // Assert
      expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledWith(
        SHOPKEEPER_REFRESH_TOKEN_KEY
      );
      expect(useShopkeeperAuthStore.getState().accessToken).toBeNull();
    });
  });
});