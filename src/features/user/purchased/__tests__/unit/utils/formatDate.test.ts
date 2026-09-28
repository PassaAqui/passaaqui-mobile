import { formatDateBR } from "@/src/features/user/purchased/utils/formatDate";

describe("formatDateBR", () => {
  it("converte yyyy-MM-dd para dd/mm/aaaa", () => {
    expect(formatDateBR("2026-04-20")).toBe("20/04/2026");
  });

  it("formata também datas com horário/ISO completo", () => {
    expect(formatDateBR("2026-04-20T18:30:00.000Z")).toBe("20/04/2026");
  });

  it("não sofre deslocamento de fuso horário", () => {
    expect(formatDateBR("2026-01-01")).toBe("01/01/2026");
  });

  it("devolve string vazia para datas ausentes", () => {
    expect(formatDateBR(null)).toBe("");
    expect(formatDateBR(undefined)).toBe("");
    expect(formatDateBR("")).toBe("");
  });

  it("devolve o valor original quando a data é inválida", () => {
    expect(formatDateBR("sem data")).toBe("sem data");
  });
});
