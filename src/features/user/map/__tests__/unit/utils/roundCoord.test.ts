import { roundCoord } from "@/src/features/user/map/utils/roundCoord";

describe("roundCoord", () => {
  it("arredonda para 3 casas decimais", () => {
    // Arrange
    const input = -8.0675;

    // Act
    const result = roundCoord(input);

    // Assert
    expect(result).toBe(-8.068);
  });

  it("arredonda para cima quando a 4ª casa é >= 5", () => {
    // Arrange
    const input = 12.3456;

    // Act
    const result = roundCoord(input);

    // Assert
    expect(result).toBe(12.346);
  });

  it("mantém o valor quando a 4ª casa é < 5", () => {
    // Arrange
    const input = 12.3454;

    // Act
    const result = roundCoord(input);

    // Assert
    expect(result).toBe(12.345);
  });

  it("arredonda números negativos", () => {
    // Arrange
    const input = -34.9167;

    // Act
    const result = roundCoord(input);

    // Assert
    expect(result).toBe(-34.917);
  });

  it("retorna zero para zero", () => {
    // Arrange
    const input = 0;

    // Act
    const result = roundCoord(input);

    // Assert
    expect(result).toBe(0);
  });

  it("mantém números inteiros intactos", () => {
    // Arrange
    const input = 7;

    // Act
    const result = roundCoord(input);

    // Assert
    expect(result).toBe(7);
  });
});
