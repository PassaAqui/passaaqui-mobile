import { editProfileSchema } from "@/src/features/user/settings/schemas/editProfileSchema";

describe("editProfileSchema", () => {
  it("aceita um nome válido", () => {
    // Act
    const result = editProfileSchema.safeParse({ name: "João Turista" });

    // Assert
    expect(result.success).toBe(true);
  });

  it("aplica trim no nome", () => {
    // Act
    const result = editProfileSchema.safeParse({ name: "  Maria Silva  " });

    // Assert
    expect(result.success).toBe(true);
    expect(result.success && result.data.name).toBe("Maria Silva");
  });

  it("rejeita nome vazio", () => {
    // Act
    const result = editProfileSchema.safeParse({ name: "" });

    // Assert
    expect(result.success).toBe(false);
  });

  it("rejeita nome com apenas espaços", () => {
    // Act
    const result = editProfileSchema.safeParse({ name: "   " });

    // Assert
    expect(result.success).toBe(false);
  });

  it("rejeita nome com menos de 3 caracteres", () => {
    // Act
    const result = editProfileSchema.safeParse({ name: "Ab" });

    // Assert
    expect(result.success).toBe(false);
    expect(result.success === false && result.error.issues[0].message).toBe(
      "O nome deve ter pelo menos 3 caracteres."
    );
  });

  it("aceita nome com exatamente 3 caracteres", () => {
    // Act
    const result = editProfileSchema.safeParse({ name: "Ana" });

    // Assert
    expect(result.success).toBe(true);
  });

  it("aceita nome com exatamente 50 caracteres", () => {
    // Act
    const result = editProfileSchema.safeParse({ name: "A".repeat(50) });

    // Assert
    expect(result.success).toBe(true);
  });

  it("rejeita nome com mais de 50 caracteres", () => {
    // Act
    const result = editProfileSchema.safeParse({ name: "A".repeat(51) });

    // Assert
    expect(result.success).toBe(false);
    expect(result.success === false && result.error.issues[0].message).toBe(
      "O nome deve ter no máximo 50 caracteres."
    );
  });

  it("considera o tamanho depois do trim", () => {
    // Act
    const result = editProfileSchema.safeParse({ name: "  Ab  " });

    // Assert
    expect(result.success).toBe(false);
  });
});
