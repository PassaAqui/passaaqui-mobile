import { editProductSchema } from "@/src/features/shopkeeper/products/schemas/editProductSchema";
import { validEditFormValues } from "@/src/features/shopkeeper/products/__tests__/fixtures/products";

describe("editProductSchema", () => {
  it("aceita entrada válida (completa)", () => {
    // Arrange
    const input = validEditFormValues;

    // Act
    const result = editProductSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(input);
    }
  });

  it("rejeita nome ausente", () => {
    // Arrange
    const input = { ...validEditFormValues };
    delete (input as Partial<typeof input>).name;

    // Act
    const result = editProductSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === "name")).toBe(true);
    }
  });

  it("rejeita nome vazio", () => {
    // Arrange
    const input = { ...validEditFormValues, name: "" };

    // Act
    const result = editProductSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === "name" && i.message === "Informe o nome do produto")).toBe(true);
    }
  });

  it("rejeita nome com apenas espaços", () => {
    // Arrange
    const input = { ...validEditFormValues, name: "   " };

    // Act
    const result = editProductSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === "name" && i.message === "Informe o nome do produto")).toBe(true);
    }
  });

  it("rejeita categoria null", () => {
    // Arrange
    const input = { ...validEditFormValues, category: null };

    // Act
    const result = editProductSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === "category" && i.message === "Selecione uma categoria")).toBe(true);
    }
  });

  it("rejeita preço zero", () => {
    // Arrange
    const input = { ...validEditFormValues, price: 0 };

    // Act
    const result = editProductSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === "price" && i.message === "Informe um preço válido")).toBe(true);
    }
  });

  it("rejeita preço negativo", () => {
    // Arrange
    const input = { ...validEditFormValues, price: -1 };

    // Act
    const result = editProductSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === "price" && i.message === "Informe um preço válido")).toBe(true);
    }
  });

  it("aceita preço mínimo positivo (0.01)", () => {
    // Arrange
    const input = { ...validEditFormValues, price: 0.01 };

    // Act
    const result = editProductSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(true);
  });

  it("rejeita quantidade negativa", () => {
    // Arrange
    const input = { ...validEditFormValues, quantity: -1 };

    // Act
    const result = editProductSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === "quantity" && i.message === "Quantidade não pode ser negativa")).toBe(true);
    }
  });

  it("aceita quantidade zero (edit permite 0)", () => {
    // Arrange
    const input = { ...validEditFormValues, quantity: 0 };

    // Act
    const result = editProductSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(true);
  });

  it("aceita descrição opcional ausente", () => {
    // Arrange
    const input = { ...validEditFormValues };
    delete (input as Partial<typeof input>).description;

    // Act
    const result = editProductSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(true);
  });
});
