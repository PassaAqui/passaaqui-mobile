import { createProductSchema } from "@/src/features/shopkeeper/products/schemas/createProductSchema";
import { validCreateFormValues } from "@/src/features/shopkeeper/products/__tests__/fixtures/products";

describe("createProductSchema", () => {
  it("aceita entrada válida (completa)", () => {
    // Arrange
    const input = validCreateFormValues;

    // Act
    const result = createProductSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(input);
    }
  });

  it("rejeita nome ausente", () => {
    // Arrange
    const input = { ...validCreateFormValues };
    delete (input as Partial<typeof input>).name;

    // Act
    const result = createProductSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === "name")).toBe(true);
    }
  });

  it("rejeita nome vazio", () => {
    // Arrange
    const input = { ...validCreateFormValues, name: "" };

    // Act
    const result = createProductSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === "name" && i.message === "Nome é obrigatório")).toBe(true);
    }
  });

  it("rejeita nome com apenas espaços", () => {
    // Arrange
    const input = { ...validCreateFormValues, name: "   " };

    // Act
    const result = createProductSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === "name" && i.message === "Nome é obrigatório")).toBe(true);
    }
  });

  it("rejeita categoria ausente", () => {
    // Arrange
    const input = { ...validCreateFormValues };
    delete (input as Partial<typeof input>).category;

    // Act
    const result = createProductSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === "category" && i.message === "Categoria é obrigatória")).toBe(true);
    }
  });

  it("rejeita preço zero", () => {
    // Arrange
    const input = { ...validCreateFormValues, price: 0 };

    // Act
    const result = createProductSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === "price" && i.message === "Preço deve ser maior que zero")).toBe(true);
    }
  });

  it("rejeita preço negativo", () => {
    // Arrange
    const input = { ...validCreateFormValues, price: -1 };

    // Act
    const result = createProductSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === "price" && i.message === "Preço deve ser maior que zero")).toBe(true);
    }
  });

  it("aceita preço mínimo positivo (0.01)", () => {
    // Arrange
    const input = { ...validCreateFormValues, price: 0.01 };

    // Act
    const result = createProductSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(true);
  });

  it("rejeita quantidade zero", () => {
    // Arrange
    const input = { ...validCreateFormValues, quantity: 0 };

    // Act
    const result = createProductSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === "quantity" && i.message === "Quantidade deve ser maior que zero")).toBe(true);
    }
  });

  it("aceita quantidade mínima positiva (1)", () => {
    // Arrange
    const input = { ...validCreateFormValues, quantity: 1 };

    // Act
    const result = createProductSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(true);
  });

  it("rejeita lista de imagens vazia", () => {
    // Arrange
    const input = { ...validCreateFormValues, images: [] };

    // Act
    const result = createProductSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === "images" && i.message === "Adicione ao menos uma foto")).toBe(true);
    }
  });

  it("rejeita imagem sem uri", () => {
    // Arrange
    const input = {
      ...validCreateFormValues,
      images: [{ name: "sem-uri.jpg" } as { uri: string; name: string }],
    };

    // Act
    const result = createProductSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === "images")).toBe(true);
    }
  });

  it("aceita descrição opcional ausente", () => {
    // Arrange
    const input = { ...validCreateFormValues };
    delete (input as Partial<typeof input>).description;

    // Act
    const result = createProductSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(true);
  });
});
