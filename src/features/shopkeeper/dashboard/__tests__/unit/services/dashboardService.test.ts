import { api } from "@/src/services/api/api";
import { getDashboard } from "@/src/features/shopkeeper/dashboard/services/dashboardService";
import {
  dashboard,
  dashboardRaw,
} from "@/src/features/shopkeeper/dashboard/__tests__/fixtures/dashboard";
import { createAxiosError } from "@/src/features/shopkeeper/auth/__tests__/fixtures/shopkeeper";

// Mock HTTP: `api` (client central) para as chamadas de /dashboard.
jest.mock("@/src/services/api/api", () => ({
  api: {
    get: jest.fn(),
  },
}));

const mockedApi = api as jest.Mocked<typeof api>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("dashboardService", () => {
  describe("getDashboard", () => {
    it("normaliza o payload snake_case da API para Dashboard camelCase", async () => {
      // Arrange
      mockedApi.get.mockResolvedValueOnce({ data: dashboardRaw });

      // Act
      const result = await getDashboard();

      // Assert
      expect(mockedApi.get).toHaveBeenCalledWith("/dashboard");
      expect(result).toEqual(dashboard);
    });

    it("retorna recentOrders vazio quando recent_orders está vazio", async () => {
      // Arrange
      mockedApi.get.mockResolvedValueOnce({
        data: { ...dashboardRaw, recent_orders: [] },
      });

      // Act
      const result = await getDashboard();

      // Assert
      expect(result.recentOrders).toEqual([]);
      expect(result.ordersToday).toBe(dashboardRaw.orders_today);
    });

    it("relança o erro HTTP recebido", async () => {
      // Arrange
      const error = createAxiosError(500);
      mockedApi.get.mockRejectedValueOnce(error);

      // Act
      const promise = getDashboard();

      // Assert
      await expect(promise).rejects.toBe(error);
    });
  });
});