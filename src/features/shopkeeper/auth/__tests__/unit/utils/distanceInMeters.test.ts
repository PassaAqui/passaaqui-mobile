import {
  MIN_DISTANCE_METERS,
  distanceInMeters,
} from "@/src/features/shopkeeper/auth/utils/distanceInMeters";

describe("distanceInMeters", () => {
  it("retorna 0 para duas coordenadas idênticas", () => {
    // Arrange
    const a = { latitude: -8.0675, longitude: -34.9167 };

    // Act
    const result = distanceInMeters(a, a);

    // Assert
    expect(result).toBe(0);
  });

  it("calcula distância crescente conforme os pontos se afastam", () => {
    // Arrange
    const base = { latitude: -8.0675, longitude: -34.9167 };
    const near = { latitude: -8.06751, longitude: -34.9167 };
    const far = { latitude: -8.0676, longitude: -34.9167 };

    // Act
    const nearDistance = distanceInMeters(base, near);
    const farDistance = distanceInMeters(base, far);

    // Assert
    expect(nearDistance).toBeGreaterThan(0);
    expect(farDistance).toBeGreaterThan(nearDistance);
  });

  it("retorna o mesmo valor independente da ordem dos argumentos (simetria)", () => {
    // Arrange
    const a = { latitude: -8.0675, longitude: -34.9167 };
    const b = { latitude: -8.0676, longitude: -34.9166 };

    // Act
    const ab = distanceInMeters(a, b);
    const ba = distanceInMeters(b, a);

    // Assert
    expect(ab).toBeCloseTo(ba, 6);
  });

  it("NaN e Infinity não são produzidos para coordenadas válidas de Recife", () => {
    // Arrange
    const a = { latitude: -8.0675, longitude: -34.9167 };
    const b = { latitude: -8.05, longitude: -34.9 };

    // Act
    const result = distanceInMeters(a, b);

    // Assert
    expect(Number.isNaN(result)).toBe(false);
    expect(Number.isFinite(result)).toBe(true);
  });
});

describe("MIN_DISTANCE_METERS", () => {
  it("é 15 (limiar de bloqueio de lojas próximas)", () => {
    expect(MIN_DISTANCE_METERS).toBe(15);
  });
});