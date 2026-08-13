import { formatCpfOrCnpj } from "@/src/features/shopkeeper/auth/utils/formatCpfOrCnpj";

describe("formatCpfOrCnpj", () => {
  it("formata 11 dígitos como CPF com a máscara completa", () => {
    // Arrange
    const input = "12345678900";

    // Act
    const result = formatCpfOrCnpj(input);

    // Assert
    expect(result).toBe("123.456.789-00");
  });

  it("formata 14 dígitos como CNPJ com a máscara completa", () => {
    // Arrange
    const input = "12345678000190";

    // Act
    const result = formatCpfOrCnpj(input);

    // Assert
    expect(result).toBe("12.345.678/0001-90");
  });

  it("aplica a máscara de CPF progressivamente conforme os dígitos aumentam", () => {
    // Arrange
    const cases = [
      ["1", "1"],
      ["123", "123"],
      ["1234", "123.4"],
      ["123456", "123.456"],
      ["1234567890", "123.456.789-0"],
      ["12345678900", "123.456.789-00"],
    ];

    for (const [input, expected] of cases) {
      // Act
      const result = formatCpfOrCnpj(input);

      // Assert
      expect(result).toBe(expected);
    }
  });

  it("aplica a máscara de CNPJ progressivamente conforme os dígitos aumentam", () => {
    // Arrange
    const cases = [
      ["12", "12"],
      ["123456", "123.456"],
      ["12345678", "123.456.78"],
      ["1234567800019", "12.345.678/0001-9"],
      ["12345678000190", "12.345.678/0001-90"],
    ];

    for (const [input, expected] of cases) {
      // Act
      const result = formatCpfOrCnpj(input);

      // Assert
      expect(result).toBe(expected);
    }
  });

  it("remove caracteres não numéricos antes de formatar", () => {
    // Arrange
    const input = "abc123def";

    // Act
    const result = formatCpfOrCnpj(input);

    // Assert
    expect(result).toBe("123");
  });

  it("normaliza um CNPJ já mascarado", () => {
    // Arrange
    const input = "12.345.678/0001-90";

    // Act
    const result = formatCpfOrCnpj(input);

    // Assert
    expect(result).toBe("12.345.678/0001-90");
  });

  it("não adiciona dígitos além dos 14 primeiros", () => {
    // Arrange
    const input = "12345678000190123";

    // Act
    const result = formatCpfOrCnpj(input);

    // Assert
    expect(result).toBe("12.345.678/0001-90");
  });

  it("usa CPF para até 11 dígitos e CNPJ a partir de 12", () => {
    // Arrange
    const cpf = "12345678900";
    const cnpj = "12345678000190";

    // Act
    const resultCpf = formatCpfOrCnpj(cpf);
    const resultCnpj = formatCpfOrCnpj(cnpj);

    // Assert
    expect(resultCpf).toBe("123.456.789-00");
    expect(resultCnpj).toBe("12.345.678/0001-90");
  });

  it("retorna string vazia para entrada vazia", () => {
    // Arrange
    const input = "";

    // Act
    const result = formatCpfOrCnpj(input);

    // Assert
    expect(result).toBe("");
  });
});
