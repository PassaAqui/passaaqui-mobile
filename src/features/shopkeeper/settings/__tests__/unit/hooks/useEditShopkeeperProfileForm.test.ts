import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import React from "react";
import type { ReactNode } from "react";
import type { ShopkeeperMe } from "@/src/features/shopkeeper/auth/services/shopkeeperService";
import * as ImagePicker from "expo-image-picker";
import { useEditShopkeeperProfileForm } from "@/src/features/shopkeeper/settings/hooks/useEditShopkeeperProfileForm";
import { api } from "@/src/services/api/api";
import * as profileService from "@/src/features/shopkeeper/settings/services/profileService";
import {
  createAxiosError,
  localStoreImageUri,
  shopkeeperProfile,
  updatedShopkeeperProfile,
  STORE_IMAGE_URL,
} from "@/src/features/shopkeeper/settings/__tests__/fixtures/shopkeeperProfile";

const mockUseRouter = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => mockUseRouter(),
}));

jest.mock("expo-navigation-bar", () => ({
  setButtonStyleAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("expo-image-picker", () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

jest.mock("@/src/services/api/api", () => ({
  api: {
    get: jest.fn(),
    put: jest.fn(),
  },
}));

jest.mock("@/src/features/shopkeeper/settings/services/profileService", () => ({
  updateShopkeeperProfile: jest.fn(),
}));

const updateShopkeeperProfileMock =
  profileService.updateShopkeeperProfile as jest.Mock;
const mockedApiGet = api.get as jest.Mock;
const requestPermissionMock =
  ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock;
const launchLibraryMock = ImagePicker.launchImageLibraryAsync as jest.Mock;

function createWrapper(shopkeeper: ShopkeeperMe | undefined) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  const wrapper = ({ children }: { children: ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);

  if (shopkeeper) {
    queryClient.setQueryData(["shopkeeper-me"], shopkeeper);
  } else {
    queryClient.setQueryData(["shopkeeper-me"], undefined);
  }

  return { wrapper, queryClient };
}

async function renderForm(shopkeeper?: ShopkeeperMe) {
  const { wrapper, queryClient } = createWrapper(shopkeeper);
  const result = renderHook(() => useEditShopkeeperProfileForm(), { wrapper });

  await waitFor(() => expect(result.result.current.isLoadingShopkeeper).toBe(false));

  return { ...result, queryClient };
}

describe("useEditShopkeeperProfileForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({ back: jest.fn() });
    requestPermissionMock.mockResolvedValue({ status: "granted" });
    jest.spyOn(Alert, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("valores iniciais", () => {
    it("preenche o nome da loja com o companyName do lojista", async () => {
      // Act
      const { result } = await renderForm(shopkeeperProfile);

      // Assert
      expect(result.current.companyName).toBe(shopkeeperProfile.companyName);
    });

    it("usa a imagem do poi como foto da loja", async () => {
      // Act
      const { result } = await renderForm(shopkeeperProfile);

      // Assert
      expect(result.current.image).toBe(STORE_IMAGE_URL);
    });

    it("prioriza a foto recém-escolhida sobre a do poi", async () => {
      // Arrange
      const { result } = await renderForm(shopkeeperProfile);
      launchLibraryMock.mockResolvedValueOnce({
        canceled: false,
        assets: [{ uri: localStoreImageUri }],
      });

      // Act
      await act(async () => {
        await result.current.pickImage();
      });

      // Assert
      expect(result.current.image).toBe(localStoreImageUri);
      expect(result.current.selectedImage).toBe(localStoreImageUri);
    });

    it("mantém o texto digitado quando a query é refetched", async () => {
      // Arrange
      mockedApiGet.mockResolvedValue({ data: shopkeeperProfile });
      const { result, queryClient } = await renderForm(shopkeeperProfile);
      act(() => {
        result.current.handleCompanyNameChange("Meu Mercado");
      });
      mockedApiGet.mockResolvedValue({
        data: { ...shopkeeperProfile, companyName: "Maria Artesanatos LTDA" },
      });

      // Act
      await act(async () => {
        await queryClient.invalidateQueries({ queryKey: ["shopkeeper-me"] });
      });

      // Assert
      expect(result.current.companyName).toBe("Meu Mercado");
      expect(queryClient.getQueryData(["shopkeeper-me"])).toMatchObject({
        companyName: "Maria Artesanatos LTDA",
      });
    });
  });

  describe("edição do nome da loja", () => {
    it("atualiza o valor do campo", async () => {
      // Arrange
      const { result } = await renderForm(shopkeeperProfile);

      // Act
      act(() => {
        result.current.handleCompanyNameChange("Maria Artesanatos LTDA");
      });

      // Assert
      expect(result.current.companyName).toBe("Maria Artesanatos LTDA");
    });

    it("limpa o erro exibido ao começar a corrigir", async () => {
      // Arrange
      const { result } = await renderForm(shopkeeperProfile);
      act(() => {
        result.current.handleCompanyNameChange("Ab");
      });
      act(() => {
        result.current.handleSave();
      });
      expect(result.current.companyNameError).not.toBe("");

      // Act
      act(() => {
        result.current.handleCompanyNameChange("Maria Artesanatos");
      });

      // Assert
      expect(result.current.companyNameError).toBe("");
    });
  });

  describe("validação", () => {
    it("exibe erro e não chama a API quando o nome é muito curto", async () => {
      // Arrange
      const { result } = await renderForm(shopkeeperProfile);
      act(() => {
        result.current.handleCompanyNameChange("Ab");
      });

      // Act
      act(() => {
        result.current.handleSave();
      });

      // Assert
      expect(result.current.companyNameError).toBe(
        "O nome da loja deve ter pelo menos 3 caracteres."
      );
      expect(updateShopkeeperProfileMock).not.toHaveBeenCalled();
    });

    it("exibe erro quando o nome tem mais de 50 caracteres", async () => {
      // Arrange
      const { result } = await renderForm(shopkeeperProfile);
      act(() => {
        result.current.handleCompanyNameChange("a".repeat(51));
      });

      // Act
      act(() => {
        result.current.handleSave();
      });

      // Assert
      expect(result.current.companyNameError).toBe(
        "O nome da loja deve ter no máximo 50 caracteres."
      );
      expect(updateShopkeeperProfileMock).not.toHaveBeenCalled();
    });

    it("exibe erro quando o nome fica só com espaços", async () => {
      // Arrange
      const { result } = await renderForm(shopkeeperProfile);
      act(() => {
        result.current.handleCompanyNameChange("     ");
      });

      // Act
      act(() => {
        result.current.handleSave();
      });

      // Assert
      expect(result.current.companyNameError).not.toBe("");
      expect(updateShopkeeperProfileMock).not.toHaveBeenCalled();
    });
  });

  describe("salvamento", () => {
    it("envia apenas o companyName alterado", async () => {
      // Arrange
      updateShopkeeperProfileMock.mockResolvedValueOnce(updatedShopkeeperProfile);
      const { result } = await renderForm(shopkeeperProfile);
      act(() => {
        result.current.handleCompanyNameChange("Maria Artesanatos LTDA");
      });

      // Act
      await act(async () => {
        result.current.handleSave();
      });

      // Assert
      await waitFor(() =>
        expect(updateShopkeeperProfileMock).toHaveBeenCalledWith(
          { companyName: "Maria Artesanatos LTDA" },
          undefined
        )
      );
    });

    it("envia payload vazio quando só a foto da loja mudou", async () => {
      // Arrange
      updateShopkeeperProfileMock.mockResolvedValueOnce(updatedShopkeeperProfile);
      const { result } = await renderForm(shopkeeperProfile);
      launchLibraryMock.mockResolvedValueOnce({
        canceled: false,
        assets: [{ uri: localStoreImageUri }],
      });
      await act(async () => {
        await result.current.pickImage();
      });

      // Act
      await act(async () => {
        result.current.handleSave();
      });

      // Assert
      await waitFor(() =>
        expect(updateShopkeeperProfileMock).toHaveBeenCalledWith(
          {},
          localStoreImageUri
        )
      );
    });

    it("envia o nome da loja e a foto quando ambos mudaram", async () => {
      // Arrange
      updateShopkeeperProfileMock.mockResolvedValueOnce(updatedShopkeeperProfile);
      const { result } = await renderForm(shopkeeperProfile);
      launchLibraryMock.mockResolvedValueOnce({
        canceled: false,
        assets: [{ uri: localStoreImageUri }],
      });
      await act(async () => {
        await result.current.pickImage();
      });
      act(() => {
        result.current.handleCompanyNameChange("Maria Artesanatos LTDA");
      });

      // Act
      await act(async () => {
        result.current.handleSave();
      });

      // Assert
      await waitFor(() =>
        expect(updateShopkeeperProfileMock).toHaveBeenCalledWith(
          { companyName: "Maria Artesanatos LTDA" },
          localStoreImageUri
        )
      );
    });

    it("faz trim do nome da loja antes de enviar", async () => {
      // Arrange
      updateShopkeeperProfileMock.mockResolvedValueOnce(updatedShopkeeperProfile);
      const { result } = await renderForm(shopkeeperProfile);
      act(() => {
        result.current.handleCompanyNameChange("   Maria Artesanatos   ");
      });

      // Act
      await act(async () => {
        result.current.handleSave();
      });

      // Assert
      await waitFor(() =>
        expect(updateShopkeeperProfileMock).toHaveBeenCalledWith(
          { companyName: "Maria Artesanatos" },
          undefined
        )
      );
    });

    it("volta uma tela após salvar com sucesso", async () => {
      // Arrange
      const back = jest.fn();
      mockUseRouter.mockReturnValue({ back });
      updateShopkeeperProfileMock.mockResolvedValueOnce(updatedShopkeeperProfile);
      const { result } = await renderForm(shopkeeperProfile);
      act(() => {
        result.current.handleCompanyNameChange("Maria Artesanatos LTDA");
      });

      // Act
      await act(async () => {
        result.current.handleSave();
      });

      // Assert
      await waitFor(() => expect(back).toHaveBeenCalled());
    });

    it("não chama a API quando nada foi alterado", async () => {
      // Arrange
      const back = jest.fn();
      mockUseRouter.mockReturnValue({ back });
      const { result } = await renderForm(shopkeeperProfile);

      // Act
      await act(async () => {
        result.current.handleSave();
      });

      // Assert
      expect(updateShopkeeperProfileMock).not.toHaveBeenCalled();
      expect(back).toHaveBeenCalled();
    });

    it("considera não alterado quando o nome só difere por espaços", async () => {
      // Arrange
      const back = jest.fn();
      mockUseRouter.mockReturnValue({ back });
      const { result } = await renderForm(shopkeeperProfile);
      act(() => {
        result.current.handleCompanyNameChange(`  ${shopkeeperProfile.companyName}  `);
      });

      // Act
      await act(async () => {
        result.current.handleSave();
      });

      // Assert
      expect(updateShopkeeperProfileMock).not.toHaveBeenCalled();
      expect(back).toHaveBeenCalled();
    });

    it("exibe alerta e não volta quando o PUT falha", async () => {
      // Arrange
      const back = jest.fn();
      mockUseRouter.mockReturnValue({ back });
      updateShopkeeperProfileMock.mockRejectedValueOnce(createAxiosError(400));
      const { result } = await renderForm(shopkeeperProfile);
      act(() => {
        result.current.handleCompanyNameChange("Maria Artesanatos LTDA");
      });

      // Act
      await act(async () => {
        result.current.handleSave();
      });

      // Assert
      await waitFor(() =>
        expect(Alert.alert).toHaveBeenCalledWith(
          "Erro ao salvar",
          "Não foi possível salvar as alterações. Tente novamente."
        )
      );
      expect(back).not.toHaveBeenCalled();
    });
  });
});
