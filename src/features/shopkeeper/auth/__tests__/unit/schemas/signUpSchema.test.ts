import { shopkeeperSignUpSchema } from "@/src/features/shopkeeper/auth/schemas/signUpSchema";
import { validShopkeeperSignUpData } from "@/src/features/shopkeeper/auth/__tests__/fixtures/shopkeeper";

describe("shopkeeperSignUpSchema", () => {
  it("aceita entrada válida", () => {
    // Arrange
    const input = validShopkeeperSignUpData;

    // Act
    const result = shopkeeperSignUpSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(input);
    }
  });

  it("rejeita companyName vazio", () => {
    // Arrange
    const input = { ...validShopkeeperSignUpData, companyName: "" };

    // Act
    const result = shopkeeperSignUpSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
      expect(result.error.issues[0].message).toBe("Preencha o nome do estabelecimento");
      expect(result.error.issues[0].path).toEqual(["companyName"]);
    }
  });

  it("rejeita ownerName vazio", () => {
    // Arrange
    const input = { ...validShopkeeperSignUpData, ownerName: "" };

    // Act
    const result = shopkeeperSignUpSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
      expect(result.error.issues[0].message).toBe("Preencha o nome do proprietário");
      expect(result.error.issues[0].path).toEqual(["ownerName"]);
    }
  });

  it("rejeita email vazio", () => {
    // Arrange
    const input = { ...validShopkeeperSignUpData, email: "" };

    // Act
    const result = shopkeeperSignUpSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
      expect(result.error.issues[0].message).toBe("Preencha o campo com seu email");
      expect(result.error.issues[0].path).toEqual(["email"]);
    }
  });

  it("rejeita email com formato inválido", () => {
    // Arrange
    const input = { ...validShopkeeperSignUpData, email: "email-invalido" };

    // Act
    const result = shopkeeperSignUpSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
      expect(result.error.issues[0].message).toBe("Email inválido");
      expect(result.error.issues[0].path).toEqual(["email"]);
    }
  });

  it("rejeita documentId vazio", () => {
    // Arrange
    const input = { ...validShopkeeperSignUpData, documentId: "" };

    // Act
    const result = shopkeeperSignUpSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
      expect(result.error.issues[0].message).toBe("Preencha o campo com seu CPF ou CNPJ");
      expect(result.error.issues[0].path).toEqual(["documentId"]);
    }
  });

  it("rejeita documentId CPF sem máscara", () => {
    // Arrange
    const input = { ...validShopkeeperSignUpData, documentId: "12345678900" };

    // Act
    const result = shopkeeperSignUpSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
      expect(result.error.issues[0].message).toBe("CPF ou CNPJ inválido");
      expect(result.error.issues[0].path).toEqual(["documentId"]);
    }
  });

  it("aceita documentId CNPJ com máscara válida", () => {
    // Arrange
    const input = { ...validShopkeeperSignUpData, documentId: "12.345.678/0001-90" };

    // Act
    const result = shopkeeperSignUpSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.documentId).toBe("12.345.678/0001-90");
    }
  });

  it("rejeita password vazio", () => {
    // Arrange
    const input = { ...validShopkeeperSignUpData, password: "", confirmPassword: "" };

    // Act
    const result = shopkeeperSignUpSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
      expect(result.error.issues[0].message).toBe("Preencha o campo com sua senha");
      expect(result.error.issues[0].path).toEqual(["password"]);
    }
  });

  it("rejeita password com menos de 8 caracteres", () => {
    // Arrange
    const input = { ...validShopkeeperSignUpData, password: "Sen@1", confirmPassword: "Sen@1" };

    // Act
    const result = shopkeeperSignUpSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
      expect(result.error.issues[0].message).toBe("A senha deve ter pelo menos 8 caracteres");
      expect(result.error.issues[0].path).toEqual(["password"]);
    }
  });

  it("rejeita password com mais de 16 caracteres", () => {
    // Arrange
    const input = { ...validShopkeeperSignUpData, password: "Senha@1234567890123", confirmPassword: "Senha@1234567890123" };

    // Act
    const result = shopkeeperSignUpSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
      expect(result.error.issues[0].message).toBe("A senha deve ter no máximo 16 caracteres");
      expect(result.error.issues[0].path).toEqual(["password"]);
    }
  });

  it("rejeita password sem número", () => {
    // Arrange
    const input = { ...validShopkeeperSignUpData, password: "Senha@@@", confirmPassword: "Senha@@@" };

    // Act
    const result = shopkeeperSignUpSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
      expect(result.error.issues[0].message).toBe("A senha deve conter pelo menos um número");
      expect(result.error.issues[0].path).toEqual(["password"]);
    }
  });

  it("rejeita password sem caractere especial", () => {
    // Arrange
    const input = { ...validShopkeeperSignUpData, password: "Senha123", confirmPassword: "Senha123" };

    // Act
    const result = shopkeeperSignUpSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
      expect(result.error.issues[0].message).toBe("A senha deve conter pelo menos um caractere especial");
      expect(result.error.issues[0].path).toEqual(["password"]);
    }
  });

  it("rejeita confirmPassword vazio", () => {
    // Arrange
    const input = { ...validShopkeeperSignUpData, confirmPassword: "" };

    // Act
    const result = shopkeeperSignUpSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
      expect(result.error.issues[0].message).toBe("Preencha o campo repetindo sua senha");
      expect(result.error.issues[0].path).toEqual(["confirmPassword"]);
    }
  });

  it("rejeita quando password e confirmPassword são diferentes", () => {
    // Arrange
    const input = { ...validShopkeeperSignUpData, password: "Senha@123", confirmPassword: "Outra@123" };

    // Act
    const result = shopkeeperSignUpSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
      expect(result.error.issues[0].message).toBe("As senhas precisam ser iguais");
      expect(result.error.issues[0].path).toEqual(["confirmPassword"]);
    }
  });

  it("rejeita category vazio", () => {
    // Arrange
    const input = { ...validShopkeeperSignUpData, category: "" };

    // Act
    const result = shopkeeperSignUpSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
      expect(result.error.issues[0].message).toBe("Selecione uma categoria");
      expect(result.error.issues[0].path).toEqual(["category"]);
    }
  });

  it("rejeita neighborhood vazio", () => {
    // Arrange
    const input = { ...validShopkeeperSignUpData, neighborhood: "" };

    // Act
    const result = shopkeeperSignUpSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
      expect(result.error.issues[0].message).toBe("Preencha o bairro");
      expect(result.error.issues[0].path).toEqual(["neighborhood"]);
    }
  });

  it("rejeita street vazio", () => {
    // Arrange
    const input = { ...validShopkeeperSignUpData, street: "" };

    // Act
    const result = shopkeeperSignUpSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
      expect(result.error.issues[0].message).toBe("Preencha a rua");
      expect(result.error.issues[0].path).toEqual(["street"]);
    }
  });

  it("rejeita description vazio", () => {
    // Arrange
    const input = { ...validShopkeeperSignUpData, description: "" };

    // Act
    const result = shopkeeperSignUpSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
      expect(result.error.issues[0].message).toBe("Preencha a descrição do estabelecimento");
      expect(result.error.issues[0].path).toEqual(["description"]);
    }
  });

  it("rejeita image vazio", () => {
    // Arrange
    const input = { ...validShopkeeperSignUpData, image: "" };

    // Act
    const result = shopkeeperSignUpSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
      expect(result.error.issues[0].message).toBe("Adicione uma foto do estabelecimento");
      expect(result.error.issues[0].path).toEqual(["image"]);
    }
  });

  it("rejeita location não informado", () => {
    // Arrange
    const { location: _location, ...input } = validShopkeeperSignUpData;

    // Act
    const result = shopkeeperSignUpSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
      expect(result.error.issues[0].message).toBe("Marque a localização da loja no mapa");
      expect(result.error.issues[0].path).toEqual(["location"]);
    }
  });

  it("rejeita quando terms não é aceito", () => {
    // Arrange
    const input = { ...validShopkeeperSignUpData, terms: false };

    // Act
    const result = shopkeeperSignUpSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
      expect(result.error.issues[0].message).toBe("Você precisa aceitar os Termos de Uso e a Política de Privacidade.");
      expect(result.error.issues[0].path).toEqual(["terms"]);
    }
  });

  it("aceita poiDescription omitido e aplica default cityId 1", () => {
    // Arrange
    const { poiDescription, cityId, ...input } = validShopkeeperSignUpData;

    // Act
    const result = shopkeeperSignUpSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.cityId).toBe(1);
      expect(result.data.poiDescription).toBeUndefined();
    }
  });

  it("rejeita múltiplos campos inválidos de uma vez", () => {
    // Arrange
    const input = { ...validShopkeeperSignUpData, companyName: "", email: "invalido", documentId: "123" };

    // Act
    const result = shopkeeperSignUpSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
      expect(result.error.issues.length).toBeGreaterThanOrEqual(3);
      const messages = result.error.issues.map((e) => e.message);
      expect(messages).toContain("Preencha o nome do estabelecimento");
      expect(messages).toContain("Email inválido");
      expect(messages).toContain("CPF ou CNPJ inválido");
    }
  });
});