import { editShopkeeperProfileSchema } from "@/src/features/shopkeeper/settings/schemas/editShopkeeperProfileSchema";

describe("editShopkeeperProfileSchema", () => {
  it("aceita um nome de loja válido", () => {
    // Arrange
    const payload = { companyName: "Maria Artesanatos LTDA" };

    // Act
    const result = editShopkeeperProfileSchema.safeParse(payload);

    // Assert
    expect(result.success).toBe(true);
  });

  it("faz trim do nome da loja", () => {
    // Arrange
    const payload = { companyName: "   Maria Artesanatos   " };

    // Act
    const result = editShopkeeperProfileSchema.parse(payload);

    // Assert
    expect(result.companyName).toBe("Maria Artesanatos");
  });

  it("recusa nome com menos de 3 caracteres", () => {
    // Arrange
    const payload = { companyName: "Ab" };

    // Act
    const result = editShopkeeperProfileSchema.safeParse(payload);

    // Assert
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["companyName"]);
    }
  });

  it("recusa nome com mais de 50 caracteres", () => {
    // Arrange
    const payload = { companyName: "a".repeat(51) };

    // Act
    const result = editShopkeeperProfileSchema.safeParse(payload);

    // Assert
    expect(result.success).toBe(false);
  });

  it("recusa nome vazio ou só com espaços", () => {
    // Arrange
    const empty = { companyName: "" };
    const blank = { companyName: "     " };

    // Act
    const emptyResult = editShopkeeperProfileSchema.safeParse(empty);
    const blankResult = editShopkeeperProfileSchema.safeParse(blank);

    // Assert
    expect(emptyResult.success).toBe(false);
    expect(blankResult.success).toBe(false);
  });

  it("aceita nome com exatamente 3 ou 50 caracteres", () => {
    // Act
    const min = editShopkeeperProfileSchema.safeParse({ companyName: "abc" });
    const max = editShopkeeperProfileSchema.safeParse({
      companyName: "a".repeat(50),
    });

    // Assert
    expect(min.success).toBe(true);
    expect(max.success).toBe(true);
  });
});
