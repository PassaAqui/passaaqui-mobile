import { formatCpf } from "@/src/features/user/auth/utils/formatCpf";

describe("formatCpf", () => {
  it("formata 11 dígitos com a máscara completa", () => {
    // Arrange
    const input = "12345678900";

    // Act
    const result = formatCpf(input);

    // Assert
    expect(result).toBe("123.456.789-00");
  });

  it("aplica a máscara progressivamente conforme os dígitos aumentam", () => {
    // Arrange
    const cases = [
      ["1", "1"],
      ["12", "12"],
      ["123", "123"],
      ["1234", "123.4"],
      ["12345", "123.45"],
      ["123456", "123.456"],
      ["1234567", "123.456.7"],
      ["12345678", "123.456.78"],
      ["123456789", "123.456.789"],
      ["1234567890", "123.456.789-0"],
    ];

    for (const [input, expected] of cases) {
      // Act
      const result = formatCpf(input);

      // Assert
      expect(result).toBe(expected);
    }
  });

  it("remove caracteres não numéricos antes de formatar", () => {
    // Arrange
    const input = "abc123def";

    // Act
    const result = formatCpf(input);

    // Assert
    expect(result).toBe("123");
  });

  it("normaliza um CPF já mascarado", () => {
    // Arrange
    const input = "123.456.789-00";

    // Act
    const result = formatCpf(input);

    // Assert
    expect(result).toBe("123.456.789-00");
  });

  it("não adiciona dígitos além dos 11 primeiros", () => {
    // Arrange
    const input = "12345678900123";

    // Act
    const result = formatCpf(input);

    // Assert
    expect(result).toBe("123.456.789-00");
  });

  it("retorna string vazia para entrada vazia", () => {
    // Arrange
    const input = "";

    // Act
    const result = formatCpf(input);

    // Assert
    expect(result).toBe("");
  });
});
