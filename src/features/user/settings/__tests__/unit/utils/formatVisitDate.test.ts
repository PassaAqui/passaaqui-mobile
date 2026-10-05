import {
  formatMonthLabel,
  formatVisitDate,
} from "@/src/features/user/settings/utils/formatVisitDate";

describe("formatVisitDate", () => {
  it("formata a data e a hora no padrão dd/mm/aaaa às HH:mm", () => {
    expect(formatVisitDate("2026-05-24T14:30:00")).toBe("24/05/2026 às 14:30");
  });

  it("completa com zero à esquerda dia, mês, hora e minuto de um dígito", () => {
    expect(formatVisitDate("2026-01-05T09:05:00")).toBe("05/01/2026 às 09:05");
  });
});

describe("formatMonthLabel", () => {
  it("monta o rótulo do mês por extenso com o ano", () => {
    expect(formatMonthLabel("2026-05-24T14:30:00")).toBe("Maio de 2026");
  });

  it("usa o nome correto no primeiro e no último mês do ano", () => {
    expect(formatMonthLabel("2026-01-01T00:00:00")).toBe("Janeiro de 2026");
    expect(formatMonthLabel("2026-12-31T23:59:00")).toBe("Dezembro de 2026");
  });
});