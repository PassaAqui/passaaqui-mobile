import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import React from "react";
import type { ReactNode } from "react";
import { Alert } from "react-native";
import EditShopkeeperProfileScreen from "@/src/features/shopkeeper/settings/screens/EditShopkeeperProfileScreen";
import * as ImagePicker from "expo-image-picker";
import * as profileService from "@/src/features/shopkeeper/settings/services/profileService";
import type { ShopkeeperMe } from "@/src/features/shopkeeper/auth/services/shopkeeperService";
import {
  createAxiosError,
  localStoreImageUri,
  shopkeeperProfile,
  updatedShopkeeperProfile,
  STORE_IMAGE_URL,
} from "@/src/features/shopkeeper/settings/__tests__/fixtures/shopkeeperProfile";

const mockBack = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ back: mockBack }),
}));

jest.mock("expo-navigation-bar", () => ({
  setButtonStyleAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("expo-status-bar", () => ({ StatusBar: () => null }));

jest.mock("@expo/vector-icons", () => {
  const { Text } = require("react-native");
  return {
    Ionicons: (props: { name: string }) => <Text>{`ionicon-${props.name}`}</Text>,
  };
});

jest.mock("expo-image-picker", () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

jest.mock("@/src/services/api/api", () => ({
  api: { get: jest.fn(), put: jest.fn() },
}));

jest.mock("@/src/features/shopkeeper/settings/services/profileService", () => ({
  updateShopkeeperProfile: jest.fn(),
}));

const updateShopkeeperProfileMock =
  profileService.updateShopkeeperProfile as jest.Mock;
const requestPermissionMock =
  ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock;
const launchLibraryMock = ImagePicker.launchImageLibraryAsync as jest.Mock;

function renderScreen(shopkeeper: ShopkeeperMe | undefined) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  queryClient.setQueryData(["shopkeeper-me"], shopkeeper);

  const wrapper = ({ children }: { children: ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);

  return render(<EditShopkeeperProfileScreen />, { wrapper });
}

describe("EditShopkeeperProfileScreen (integration)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockBack.mockReturnValue(undefined);
    requestPermissionMock.mockResolvedValue({ status: "granted" });
    jest.spyOn(Alert, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renderiza o formulário de edição do perfil da loja", async () => {
    // Arrange
    renderScreen(shopkeeperProfile);

    // Act
    await screen.findByTestId("edit-shopkeeper-profile-image-button");

    // Assert
    expect(screen.getByText("Editar perfil")).toBeTruthy();
    expect(screen.getByText("Nome da loja")).toBeTruthy();
    expect(screen.getByText("Salvar alterações")).toBeTruthy();
    expect(screen.getByPlaceholderText("Digite o nome da loja")).toBeTruthy();
  });

  it("mostra a imagem do poi como foto da loja", async () => {
    // Arrange
    renderScreen(shopkeeperProfile);

    // Act
    await screen.findByTestId("edit-shopkeeper-profile-image");

    // Assert
    expect(screen.getByTestId("edit-shopkeeper-profile-image").props.source).toEqual(
      { uri: STORE_IMAGE_URL }
    );
  });

  it("cai para a logo quando o poi ainda não tem imagem", async () => {
    // Arrange
    renderScreen({ ...shopkeeperProfile, poi: { id: 10, name: "Store POI" } });

    // Act
    const image = await screen.findByTestId("edit-shopkeeper-profile-image");

    // Assert
    expect(image.props.source).toEqual({
      testUri: expect.stringContaining("logoOFC.png"),
    });
  });

  it("permite editar o nome da loja e salva o novo valor", async () => {
    // Arrange
    updateShopkeeperProfileMock.mockResolvedValueOnce(updatedShopkeeperProfile);
    renderScreen(shopkeeperProfile);
    const input = await screen.findByPlaceholderText("Digite o nome da loja");

    // Act
    fireEvent.changeText(input, "Maria Artesanatos LTDA");
    fireEvent.press(screen.getByTestId("edit-shopkeeper-profile-save-button"));

    // Assert
    await waitFor(() =>
      expect(updateShopkeeperProfileMock).toHaveBeenCalledWith(
        { companyName: "Maria Artesanatos LTDA" },
        undefined
      )
    );
    await waitFor(() => expect(mockBack).toHaveBeenCalled());
  });

  it("envia apenas a foto da loja quando só a imagem muda", async () => {
    // Arrange
    updateShopkeeperProfileMock.mockResolvedValueOnce(updatedShopkeeperProfile);
    launchLibraryMock.mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: localStoreImageUri }],
    });
    renderScreen(shopkeeperProfile);
    const button = await screen.findByTestId(
      "edit-shopkeeper-profile-image-button"
    );

    // Act
    fireEvent.press(button);
    await waitFor(() =>
      expect(screen.getByTestId("edit-shopkeeper-profile-image").props.source).toEqual(
        { uri: localStoreImageUri }
      )
    );
    fireEvent.press(screen.getByTestId("edit-shopkeeper-profile-save-button"));

    // Assert
    await waitFor(() =>
      expect(updateShopkeeperProfileMock).toHaveBeenCalledWith({}, localStoreImageUri)
    );
  });

  it("exibe erro de validação e não chama a API para nome inválido", async () => {
    // Arrange
    renderScreen(shopkeeperProfile);
    const input = await screen.findByPlaceholderText("Digite o nome da loja");

    // Act
    fireEvent.changeText(input, "Ab");
    fireEvent.press(screen.getByTestId("edit-shopkeeper-profile-save-button"));

    // Assert
    expect(
      screen.getByText("O nome da loja deve ter pelo menos 3 caracteres.")
    ).toBeTruthy();
    expect(updateShopkeeperProfileMock).not.toHaveBeenCalled();
  });

  it("exibe alerta e permanece na tela quando o PUT falha", async () => {
    // Arrange
    updateShopkeeperProfileMock.mockRejectedValueOnce(createAxiosError(400));
    renderScreen(shopkeeperProfile);
    const input = await screen.findByPlaceholderText("Digite o nome da loja");

    // Act
    fireEvent.changeText(input, "Maria Artesanatos LTDA");
    fireEvent.press(screen.getByTestId("edit-shopkeeper-profile-save-button"));

    // Assert
    await waitFor(() =>
      expect(Alert.alert).toHaveBeenCalledWith(
        "Erro ao salvar",
        "Não foi possível salvar as alterações. Tente novamente."
      )
    );
    expect(mockBack).not.toHaveBeenCalled();
  });

  it("não chama a API quando o usuário não altera nada", async () => {
    // Arrange
    renderScreen(shopkeeperProfile);
    const button = await screen.findByTestId(
      "edit-shopkeeper-profile-save-button"
    );

    // Act
    fireEvent.press(button);

    // Assert
    await waitFor(() => expect(mockBack).toHaveBeenCalled());
    expect(updateShopkeeperProfileMock).not.toHaveBeenCalled();
  });

  it("desabilita o botão de salvar durante o envio", async () => {
    // Arrange
    let resolveMutation: (value: ShopkeeperMe) => void = () => {};
    updateShopkeeperProfileMock.mockImplementationOnce(
      () =>
        new Promise<ShopkeeperMe>((resolve) => {
          resolveMutation = resolve;
        })
    );
    renderScreen(shopkeeperProfile);
    const input = await screen.findByPlaceholderText("Digite o nome da loja");

    // Act
    fireEvent.changeText(input, "Maria Artesanatos LTDA");
    fireEvent.press(screen.getByTestId("edit-shopkeeper-profile-save-button"));

    // Assert
    await waitFor(() =>
      expect(screen.getByTestId("edit-shopkeeper-profile-saving")).toBeTruthy()
    );
    expect(
      screen.getByTestId("edit-shopkeeper-profile-save-button").props.accessibilityState
    ).toMatchObject({ disabled: true });

    resolveMutation(updatedShopkeeperProfile);
  });

  it("mantém o botão de salvar habilitado quando não está salvando", async () => {
    // Arrange
    renderScreen(shopkeeperProfile);
    await screen.findByTestId("edit-shopkeeper-profile-save-button");

    // Act
    await waitFor(() =>
      expect(screen.queryByTestId("edit-shopkeeper-profile-saving")).toBeNull()
    );

    // Assert
    expect(
      screen.getByTestId("edit-shopkeeper-profile-save-button").props.accessibilityState
    ).toMatchObject({ disabled: false });
  });
});
