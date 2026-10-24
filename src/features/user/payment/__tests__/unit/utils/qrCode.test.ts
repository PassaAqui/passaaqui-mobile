import { buildQrCodeUri } from "@/src/features/user/payment/utils/qrCode";

describe("buildQrCodeUri", () => {
  it("adiciona o prefixo quando recebe base64 puro", () => {
    // Act
    const result = buildQrCodeUri("base64-seed");

    // Assert
    expect(result).toBe("data:image/png;base64,base64-seed");
  });

  it("mantém o data URI quando já vem prefixado", () => {
    // Act
    const result = buildQrCodeUri("data:image/png;base64,prefixed-seed");

    // Assert
    expect(result).toBe("data:image/png;base64,prefixed-seed");
  });

  it("remove espaços ao redor do valor", () => {
    // Act
    const result = buildQrCodeUri("  base64-seed  ");

    // Assert
    expect(result).toBe("data:image/png;base64,base64-seed");
  });

  it("retorna null para string vazia", () => {
    // Act
    const result = buildQrCodeUri("");

    // Assert
    expect(result).toBeNull();
  });

  it("retorna null para null e undefined", () => {
    // Act / Assert
    expect(buildQrCodeUri(null)).toBeNull();
    expect(buildQrCodeUri(undefined)).toBeNull();
  });
});
