import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import type { ReactNode } from "react";
import ShopkeeperSettingScreen from "@/src/features/shopkeeper/settings/screens/ShopkeeperSettingScreen";
import {
  shopkeeperProfile,
  updatedShopkeeperProfile,
  UPDATED_STORE_IMAGE_URL,
  STORE_IMAGE_URL,
} from "@/src/features/shopkeeper/settings/__tests__/fixtures/shopkeeperProfile";

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

const mockRouterPush = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockRouterPush }),
}));

jest.mock("expo-navigation-bar", () => ({
  setButtonStyleAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("expo-status-bar", () => ({ StatusBar: () => null }));

function renderScreen(shopkeeper = shopkeeperProfile) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  queryClient.setQueryData(["shopkeeper-me"], shopkeeper);

  const wrapper = ({ children }: { children: ReactNode }) =>
    React.createElement(
      SafeAreaProvider,
      {
        initialMetrics: {
          frame: { x: 0, y: 0, width: 390, height: 844 },
          insets: { top: 0, left: 0, right: 0, bottom: 0 },
        },
      },
      React.createElement(QueryClientProvider, { client: queryClient }, children)
    );

  return render(<ShopkeeperSettingScreen />, { wrapper });
}

describe("ShopkeeperSettingScreen (integration)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouterPush.mockReturnValue(undefined);
  });

  it("mostra a imagem do poi como foto da loja", async () => {
    // Arrange
    renderScreen();

    // Act
    const image = await screen.findByTestId("shopkeeper-settings-image");

    // Assert
    expect(image.props.source).toEqual({ uri: STORE_IMAGE_URL });
  });

  it("cai para a logo quando o poi ainda não tem imagem", async () => {
    // Arrange
    renderScreen({ ...shopkeeperProfile, poi: { id: 10, name: "Store POI" } });

    // Act
    const image = await screen.findByTestId("shopkeeper-settings-image");

    // Assert
    expect(image.props.source).toEqual({
      testUri: expect.stringContaining("logoOFC.png"),
    });
  });

  it("mantém a identidade do lojista com nome e email", async () => {
    // Arrange
    renderScreen();

    // Act
    await screen.findByTestId("shopkeeper-settings-image");

    // Assert
    expect(screen.getByText(shopkeeperProfile.name)).toBeTruthy();
    expect(screen.getByText(shopkeeperProfile.email)).toBeTruthy();
  });

  it("reflete a nova foto depois que o perfil é atualizado na cache", async () => {
    // Arrange
    renderScreen(updatedShopkeeperProfile);

    // Act
    const image = await screen.findByTestId("shopkeeper-settings-image");

    // Assert
    expect(image.props.source).toEqual({ uri: UPDATED_STORE_IMAGE_URL });
  });

  it("permite navegar para a edição do perfil da loja", async () => {
    // Arrange
    renderScreen();
    const profileRow = await screen.findByText("Editar perfil da loja");

    // Act
    fireEvent.press(profileRow);

    // Assert
    expect(mockRouterPush).toHaveBeenCalledWith(
      "/shopkeeper/(private)/settings/edit-shopkeeper-profile"
    );
  });
});
