import { api } from "@/src/services/api/api";
import { getShopkeeperMe } from "@/src/features/shopkeeper/auth/services/shopkeeperService";
import {
  createAxiosError,
  shopkeeperMe,
} from "@/src/features/shopkeeper/auth/__tests__/fixtures/shopkeeper";

// Mock HTTP: `api` (client central) para a chamada via `api.get`.
jest.mock("@/src/services/api/api", () => ({
  api: {
    get: jest.fn(),
  },
}));

const mockedApi = api as jest.Mocked<typeof api>;

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("shopkeeperService", () => {
  describe("getShopkeeperMe", () => {
    it("retorna o perfil do lojista autenticado sem normalização", async () => {
      // Arrange
      mockedApi.get.mockResolvedValueOnce({ data: shopkeeperMe });

      // Act
      const me = await getShopkeeperMe();

      // Assert
      expect(mockedApi.get).toHaveBeenCalledWith("/shopkeepers/me");
      expect(me).toEqual(shopkeeperMe);
    });

    it("relança o erro quando a requisição falha", async () => {
      // Arrange
      const error = createAxiosError(500);
      mockedApi.get.mockRejectedValueOnce(error);

      // Act
      const result = getShopkeeperMe();

      // Assert
      await expect(result).rejects.toBe(error);
      expect(mockedApi.get).toHaveBeenCalledWith("/shopkeepers/me");
    });
  });
});