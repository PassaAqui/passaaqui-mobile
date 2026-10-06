import {
  resolveDetailStatus,
  resolveDetailStatusConfig,
} from "@/src/features/shopkeeper/orders/utils/orderDetailStatusAdapter";

describe("orderDetailStatusAdapter", () => {
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("resolveDetailStatus", () => {
    it("mapeia AWAIT_PAYMENT para Pendente", () => {
      // Act
      const status = resolveDetailStatus("AWAIT_PAYMENT");

      // Assert
      expect(status).toBe("Pendente");
    });

    it("mapeia COMPLETED para Concluído", () => {
      // Act
      const status = resolveDetailStatus("COMPLETED");

      // Assert
      expect(status).toBe("Concluído");
    });

    it("usa o fallback Pendente para status desconhecido e registra warning", () => {
      // Act
      const status = resolveDetailStatus("IN_TRANSIT");

      // Assert
      expect(status).toBe("Pendente");
      expect(warnSpy).toHaveBeenCalledWith(
        '[orders] status desconhecido recebido da API: "IN_TRANSIT". Usando fallback "Pendente".'
      );
    });
  });

  describe("resolveDetailStatusConfig", () => {
    it("retorna a configuração de Pendente para AWAIT_PAYMENT", () => {
      // Act
      const cfg = resolveDetailStatusConfig("AWAIT_PAYMENT");

      // Assert
      expect(cfg.label).toBe("Pendente");
      expect(cfg.icon).toBe("hourglass-outline");
      expect(cfg.bgColor).toBe("#F3F3F3");
    });

    it("retorna a configuração de Concluído para COMPLETED", () => {
      // Act
      const cfg = resolveDetailStatusConfig("COMPLETED");

      // Assert
      expect(cfg.label).toBe("Concluído");
      expect(cfg.icon).toBe("checkmark-circle");
      expect(cfg.bgColor).toBe("#DCFCE7");
    });

    it("retorna a configuração do fallback para status desconhecido", () => {
      // Act
      const cfg = resolveDetailStatusConfig("IN_TRANSIT");

      // Assert
      expect(cfg.label).toBe("Pendente");
      expect(cfg.icon).toBe("hourglass-outline");
    });
  });
});