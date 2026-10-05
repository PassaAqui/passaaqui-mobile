import { api } from "@/src/services/api/api";
import {
  updateTouristProfile,
  updateTouristAvatar,
} from "@/src/features/user/settings/services/profileService";
import {
  createAxiosError,
  localAvatarUri,
  updatedTouristProfile,
} from "@/src/features/user/settings/__tests__/fixtures/profile";

jest.mock("@/src/services/api/api", () => ({
  api: {
    put: jest.fn(),
    patch: jest.fn(),
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

  describe("updateTouristProfile", () => {
    it("chama PUT /tourists/me com o Content-Type multipart/form-data", async () => {
      // Arrange
      mockedApi.put.mockResolvedValueOnce({ data: updatedTouristProfile });

      // Act
      await updateTouristProfile({ name: "João Turista Atualizado" });

      // Assert
      expect(mockedApi.put).toHaveBeenCalledWith(
        "/tourists/me",
        expect.any(FormData),
        { headers: { "Content-Type": "multipart/form-data" } }
      );
    });

    it("monta a parte JSON data com o nome enviado", async () => {
      // Arrange
      mockedApi.put.mockResolvedValueOnce({ data: updatedTouristProfile });

      // Act
      await updateTouristProfile({ name: "João Turista Atualizado" });

      // Assert
      expect(appendedJson("data")).toEqual({ name: "João Turista Atualizado" });
    });

    it("envia a parte data como application/json", async () => {
      // Arrange
      mockedApi.put.mockResolvedValueOnce({ data: updatedTouristProfile });

      // Act
      await updateTouristProfile({ name: "João Turista Atualizado" });

      // Assert
      expect(appendedPart("data")).toMatchObject({
        name: "data",
        type: "application/json",
      });
    });

    it("anexa a parte image com uri, nome e tipo derivados da URI", async () => {
      // Arrange
      mockedApi.put.mockResolvedValueOnce({ data: updatedTouristProfile });

      // Act
      await updateTouristProfile({ name: "João Turista Atualizado" }, localAvatarUri);

      // Assert
      expect(appendedPart("image")).toEqual({
        uri: localAvatarUri,
        name: "avatar-1.jpg",
        type: "image/jpeg",
      });
    });

    it("não anexa a parte image quando nenhuma foto foi escolhida", async () => {
      // Arrange
      mockedApi.put.mockResolvedValueOnce({ data: updatedTouristProfile });

      // Act
      await updateTouristProfile({ name: "João Turista Atualizado" });

      // Assert
      expect(appendedPart("image")).toBeUndefined();
    });

    it("detecta o mime type png pelo nome do arquivo", async () => {
      // Arrange
      mockedApi.put.mockResolvedValueOnce({ data: updatedTouristProfile });

      // Act
      await updateTouristProfile({}, "file:///var/mobile/avatar.png");

      // Assert
      expect(appendedPart("image")).toMatchObject({ type: "image/png" });
    });

    it("devolve o TouristModel retornado pelo PUT", async () => {
      // Arrange
      mockedApi.put.mockResolvedValueOnce({ data: updatedTouristProfile });

      // Act
      const result = await updateTouristProfile({
        name: "João Turista Atualizado",
      });

      // Assert
      expect(result).toEqual(updatedTouristProfile);
    });

    it("relança o erro HTTP recebido", async () => {
      // Arrange
      const error = createAxiosError(400);
      mockedApi.put.mockRejectedValueOnce(error);

      // Act
      const promise = updateTouristProfile({ name: "João" });

      // Assert
      await expect(promise).rejects.toBe(error);
    });
  });

  describe("updateTouristAvatar", () => {
    it("chama PATCH /tourists/me/avatar apenas com a parte image", async () => {
      // Arrange
      mockedApi.patch.mockResolvedValueOnce({ data: updatedTouristProfile });

      // Act
      await updateTouristAvatar(localAvatarUri);

      // Assert
      expect(mockedApi.patch).toHaveBeenCalledWith(
        "/tourists/me/avatar",
        expect.any(FormData),
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      expect(appendedPart("image")).toEqual({
        uri: localAvatarUri,
        name: "avatar-1.jpg",
        type: "image/jpeg",
      });
      expect(appendedPart("data")).toBeUndefined();
    });

    it("relança o erro HTTP recebido", async () => {
      // Arrange
      const error = createAxiosError(400);
      mockedApi.patch.mockRejectedValueOnce(error);

      // Act
      const promise = updateTouristAvatar(localAvatarUri);

      // Assert
      await expect(promise).rejects.toBe(error);
    });
  });
});
