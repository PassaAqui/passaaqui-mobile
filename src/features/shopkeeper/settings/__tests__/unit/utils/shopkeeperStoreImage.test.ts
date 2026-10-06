import { getShopkeeperStoreImageUrl } from "@/src/features/shopkeeper/settings/utils/shopkeeperStoreImage";
import {
  shopkeeperProfile,
  STORE_IMAGE_URL,
} from "@/src/features/shopkeeper/settings/__tests__/fixtures/shopkeeperProfile";

describe("getShopkeeperStoreImageUrl", () => {
  it("devolve a imagem do poi como fonte da foto da loja", () => {
    // Arrange
    const profile = shopkeeperProfile;

    // Act
    const result = getShopkeeperStoreImageUrl(profile);

    // Assert
    expect(result).toBe(STORE_IMAGE_URL);
  });

  it("devolve null quando o poi ainda não tem imagem", () => {
    // Arrange
    const profile = { ...shopkeeperProfile, poi: { id: 10, name: "Store POI" } };

    // Act
    const result = getShopkeeperStoreImageUrl(profile);

    // Assert
    expect(result).toBeNull();
  });

  it("não usa a imagem de avatar do lojista como foto da loja", () => {
    // Arrange
    const profile = { ...shopkeeperProfile, poi: { id: 10, name: "Store POI" } };

    // Act
    const result = getShopkeeperStoreImageUrl(profile);

    // Assert
    expect(result).not.toBe(shopkeeperProfile.image);
    expect(result).toBeNull();
  });

  it("devolve null quando não há lojista carregado", () => {
    // Arrange
    const profile = null;

    // Act
    const result = getShopkeeperStoreImageUrl(profile);

    // Assert
    expect(result).toBeNull();
  });

  it("devolve null quando o perfil é undefined", () => {
    // Act
    const result = getShopkeeperStoreImageUrl(undefined);

    // Assert
    expect(result).toBeNull();
  });
});
