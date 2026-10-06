import {
  STATUS_API,
  STATUS_CONFIG,
  STATUS_LABEL,
  formatRelativeTime,
  mapToDisplayOrder,
} from "@/src/features/shopkeeper/orders/utils/orderMapper";
import {
  apiOrder,
  apiCompletedOrder,
  displayOrder,
  FIXED_NOW_ISO,
} from "@/src/features/shopkeeper/orders/__tests__/fixtures/orders";

const FIXED_NOW = new Date(FIXED_NOW_ISO).getTime();

describe("orderMapper", () => {
  beforeEach(() => {
    jest.spyOn(Date, "now").mockReturnValue(FIXED_NOW);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("STATUS_LABEL", () => {
    it("mapeia AWAIT_PAYMENT para Pendente", () => {
      // Act
      const label = STATUS_LABEL.AWAIT_PAYMENT;

      // Assert
      expect(label).toBe("Pendente");
    });

    it("mapeia COMPLETED para Concluído", () => {
      // Act
      const label = STATUS_LABEL.COMPLETED;

      // Assert
      expect(label).toBe("Concluído");
    });
  });

  describe("STATUS_API", () => {
    it("mapeia Pendente para AWAIT_PAYMENT", () => {
      // Act
      const apiStatus = STATUS_API.Pendente;

      // Assert
      expect(apiStatus).toBe("AWAIT_PAYMENT");
    });

    it("mapeia Concluído para COMPLETED", () => {
      // Act
      const apiStatus = STATUS_API.Concluído;

      // Assert
      expect(apiStatus).toBe("COMPLETED");
    });

    it("é espelho de STATUS_LABEL", () => {
      // Arrange / Act
      const labels = Object.keys(STATUS_LABEL) as (keyof typeof STATUS_LABEL)[];

      // Assert
      labels.forEach((api) => expect(STATUS_API[STATUS_LABEL[api]]).toBe(api));
    });
  });

  describe("STATUS_CONFIG", () => {
    it("define a configuração do status Pendente", () => {
      // Act
      const cfg = STATUS_CONFIG.Pendente;

      // Assert
      expect(cfg.label).toBe("Pendente");
      expect(cfg.icon).toBe("hourglass-outline");
      expect(cfg.iconColor).toBe("#8A8A8A");
    });

    it("define a configuração do status Concluído", () => {
      // Act
      const cfg = STATUS_CONFIG.Concluído;

      // Assert
      expect(cfg.label).toBe("Concluído");
      expect(cfg.icon).toBe("checkmark-circle");
      expect(cfg.iconColor).toBe("#22C55E");
    });
  });

  describe("formatRelativeTime", () => {
    it("retorna Agora para diferença menor que um minuto", () => {
      // Arrange
      const createdAt = "2026-08-14T11:59:30Z";

      // Act
      const time = formatRelativeTime(createdAt);

      // Assert
      expect(time).toBe("Agora");
    });

    it("retorna Há 5 min para diferença de cinco minutos", () => {
      // Arrange
      const createdAt = "2026-08-14T11:55:00Z";

      // Act
      const time = formatRelativeTime(createdAt);

      // Assert
      expect(time).toBe("Há 5 min");
    });

    it("retorna Há 3h para diferença de três horas", () => {
      // Arrange
      const createdAt = "2026-08-14T09:00:00Z";

      // Act
      const time = formatRelativeTime(createdAt);

      // Assert
      expect(time).toBe("Há 3h");
    });

    it("retorna Há 2d para diferença de dois dias", () => {
      // Arrange
      const createdAt = "2026-08-12T12:00:00Z";

      // Act
      const time = formatRelativeTime(createdAt);

      // Assert
      expect(time).toBe("Há 2d");
    });

    it("não lança com data futura e retorna Agora", () => {
      // Arrange
      const createdAt = "2026-08-14T13:00:00Z";

      // Act
      const time = formatRelativeTime(createdAt);

      // Assert
      expect(time).toBe("Agora");
    });
  });

  describe("mapToDisplayOrder", () => {
    it("mapeia o pedido da API para a exibição completa", () => {
      // Act
      const result = mapToDisplayOrder(apiOrder);

      // Assert
      expect(result).toEqual(displayOrder);
    });

    it("deriva as iniciais de nome único", () => {
      // Arrange
      const singleNameOrder = { ...apiCompletedOrder, customer_name: "Ana" };

      // Act
      const result = mapToDisplayOrder(singleNameOrder);

      // Assert
      expect(result.initials).toBe("A");
    });

    it("mantém o código sem # quando ele não começa com #", () => {
      // Arrange
      const order = { ...apiCompletedOrder, code: "CD2031" };

      // Act
      const result = mapToDisplayOrder(order);

      // Assert
      expect(result.code).toBe("CD2031");
    });

    it("não lança com itens vazios", () => {
      // Arrange
      const order = { ...apiOrder, items: [] };

      // Act
      const result = mapToDisplayOrder(order);

      // Assert
      expect(result.items).toBe("");
    });

    it("mapeia o status COMPLETED para Concluído", () => {
      // Act
      const result = mapToDisplayOrder(apiCompletedOrder);

      // Assert
      expect(result.status).toBe("Concluído");
      expect(result.name).toBe("Ana");
    });
  });
});