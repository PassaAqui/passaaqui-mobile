import { api } from "@/src/services/api/api";
import { updateShopkeeperProfile } from "@/src/features/shopkeeper/settings/services/profileService";
import {
  createAxiosError,
  localStoreImageUri,
  updatedShopkeeperProfile,
} from "@/src/features/shopkeeper/settings/__tests__/fixtures/shopkeeperProfile";

jest.mock("@/src/services/api/api", () => ({
  api: {
    put: jest.fn(),
  },
}));

const mockedApi = api as jest.Mocked<typeof api>;

type FormDataPart = {
  uri: string;
  name: string;
  type: string;
};

let appendSpy: jest.SpyInstance;

function appendedPart(key: string): FormDataPart | undefined {
  const call = appendSpy.mock.calls.find(([name]) => name === key);
  return call?.[1] as unknown as FormDataPart;
}

function appendedJson(key: string): Record<string, unknown> {
  const part = appendedPart(key);
  const [, base64] = part!.uri.split(",");
  return JSON.parse(atob(base64));
}

describe("profileService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    appendSpy = jest.spyOn(FormData.prototype, "append");
  });

  afterEach(() => {
    appendSpy.mockRestore();
  });

  describe("updateShopkeeperProfile", () => {
    it("chama PUT /shopkeepers/me com o Content-Type multipart/form-data", async () => {
      // Arrange
      mockedApi.put.mockResolvedValueOnce({ data: updatedShopkeeperProfile });

      // Act
      await updateShopkeeperProfile({ companyName: "Maria Artesanatos LTDA" });

      // Assert
      expect(mockedApi.put).toHaveBeenCalledWith(
        "/shopkeepers/me",
        expect.any(FormData),
        { headers: { "Content-Type": "multipart/form-data" } }
      );
    });

    it("monta a parte JSON data com o companyName enviado", async () => {
      // Arrange
      mockedApi.put.mockResolvedValueOnce({ data: updatedShopkeeperProfile });

      // Act
      await updateShopkeeperProfile({ companyName: "Maria Artesanatos LTDA" });

      // Assert
      expect(appendedJson("data")).toEqual({
        companyName: "Maria Artesanatos LTDA",
      });
    });

    it("envia a parte data como application/json", async () => {
      // Arrange
      mockedApi.put.mockResolvedValueOnce({ data: updatedShopkeeperProfile });

      // Act
      await updateShopkeeperProfile({ companyName: "Maria Artesanatos LTDA" });

      // Assert
      expect(appendedPart("data")).toMatchObject({
        name: "data",
        type: "application/json",
      });
    });

    it("anexa a parte poiImage com uri, nome e tipo derivados da URI", async () => {
      // Arrange
      mockedApi.put.mockResolvedValueOnce({ data: updatedShopkeeperProfile });

      // Act
      await updateShopkeeperProfile(
        { companyName: "Maria Artesanatos LTDA" },
        localStoreImageUri
      );

      // Assert
      expect(appendedPart("poiImage")).toEqual({
        uri: localStoreImageUri,
        name: "loja-10.jpg",
        type: "image/jpeg",
      });
    });

    it("não anexa a parte poiImage quando nenhuma foto foi escolhida", async () => {
      // Arrange
      mockedApi.put.mockResolvedValueOnce({ data: updatedShopkeeperProfile });

      // Act
      await updateShopkeeperProfile({ companyName: "Maria Artesanatos LTDA" });

      // Assert
      expect(appendedPart("poiImage")).toBeUndefined();
    });

    it("não envia a parte image do avatar do lojista", async () => {
      // Arrange
      mockedApi.put.mockResolvedValueOnce({ data: updatedShopkeeperProfile });

      // Act
      await updateShopkeeperProfile({ companyName: "Maria Artesanatos LTDA" });

      // Assert
      expect(appendedPart("image")).toBeUndefined();
    });

    it("envia um payload vazio quando só a foto da loja mudou", async () => {
      // Arrange
      mockedApi.put.mockResolvedValueOnce({ data: updatedShopkeeperProfile });

      // Act
      await updateShopkeeperProfile({}, localStoreImageUri);

      // Assert
      expect(appendedJson("data")).toEqual({});
      expect(appendedPart("poiImage")).toBeDefined();
    });

    it("detecta o mime type png pelo nome do arquivo", async () => {
      // Arrange
      mockedApi.put.mockResolvedValueOnce({ data: updatedShopkeeperProfile });

      // Act
      await updateShopkeeperProfile({}, "file:///var/mobile/loja.png");

      // Assert
      expect(appendedPart("poiImage")).toMatchObject({ type: "image/png" });
    });

    it("devolve o ShopkeeperProfileDTO retornado pelo PUT", async () => {
      // Arrange
      mockedApi.put.mockResolvedValueOnce({ data: updatedShopkeeperProfile });

      // Act
      const result = await updateShopkeeperProfile({
        companyName: "Maria Artesanatos LTDA",
      });

      // Assert
      expect(result).toEqual(updatedShopkeeperProfile);
    });

    it("relança o erro HTTP recebido", async () => {
      // Arrange
      const error = createAxiosError(400);
      mockedApi.put.mockRejectedValueOnce(error);

      // Act
      const promise = updateShopkeeperProfile({ companyName: "Maria" });

      // Assert
      await expect(promise).rejects.toBe(error);
    });
  });
});
