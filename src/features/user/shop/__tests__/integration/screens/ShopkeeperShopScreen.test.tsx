import { fireEvent, render, screen } from "@testing-library/react-native";
import { Image } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ShopkeeperShopScreen from "@/src/features/user/shop/screens/ShopkeeperShopScreen";
import { useTouristMe } from "@/src/features/user/auth/hooks/useTouristMe";
import { useProductsByPoi } from "@/src/features/user/shop/hooks/products/useProductsByPoi";
import { poiDetail } from "@/src/features/user/map/__tests__/fixtures/map";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
}));

jest.mock("react-native-safe-area-context", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    SafeAreaView: ({ children, ...props }: any) => (
      <View {...props}>{children}</View>
    ),
    useSafeAreaInsets: jest.fn(() => ({
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    })),
  };
});

jest.mock("@/src/features/user/auth/hooks/useTouristMe", () => ({
  useTouristMe: jest.fn(),
}));

jest.mock("@/src/features/user/shop/hooks/products/useProductsByPoi", () => ({
  useProductsByPoi: jest.fn(),
}));

const mockedUseLocalSearchParams = useLocalSearchParams as jest.MockedFunction<
  typeof useLocalSearchParams
>;
const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockedUseSafeAreaInsets = useSafeAreaInsets as jest.MockedFunction<
  typeof useSafeAreaInsets
>;
const mockedUseTouristMe = useTouristMe as jest.MockedFunction<typeof useTouristMe>;
const mockedUseProductsByPoi = useProductsByPoi as jest.MockedFunction<
  typeof useProductsByPoi
>;
const mockedBack = jest.fn();
const mockedPush = jest.fn();

const user = { id: 1, name: "Turista Teste", currentXP: 120 };

describe("ShopkeeperShopScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseLocalSearchParams.mockReturnValue({ poiId: "7" });
    mockedUseRouter.mockReturnValue({
      back: mockedBack,
      push: mockedPush,
    } as unknown as ReturnType<typeof useRouter>);
    mockedUseSafeAreaInsets.mockReturnValue({
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    });
    mockedUseTouristMe.mockReturnValue({ data: user } as any);
    mockedUseProductsByPoi.mockReturnValue({
      data: poiDetail,
      isLoading: false,
    } as any);
  });

  it("mostra o nome do POI no header", () => {
    // Arrange
    render(<ShopkeeperShopScreen />);

    // Assert
    expect(screen.getByText("Marco Zero")).toBeTruthy();
  });

  it("mostra o saldo de XP", () => {
    // Arrange
    render(<ShopkeeperShopScreen />);

    // Assert
    expect(screen.getByText("SEU SALDO DE XP")).toBeTruthy();
    expect(screen.getByText("120 XP")).toBeTruthy();
  });

  it("renderiza os produtos da loja", () => {
    // Arrange
    render(<ShopkeeperShopScreen />);

    // Assert
    expect(screen.getByText("Guia turístico")).toBeTruthy();
  });

  it("mostra o empty state quando a loja não tem produtos", () => {
    // Arrange
    mockedUseProductsByPoi.mockReturnValue({
      data: { ...poiDetail, products: [] },
      isLoading: false,
    } as any);

    // Act
    render(<ShopkeeperShopScreen />);

    // Assert
    expect(
      screen.getByText("Essa loja ainda não tem produtos cadastrados.")
    ).toBeTruthy();
    expect(screen.queryByText("Guia turístico")).toBeNull();
  });

  it("chama router.back ao pressionar o botão de voltar", () => {
    // Arrange
    render(<ShopkeeperShopScreen />);

    // Act
    fireEvent.press(screen.UNSAFE_getAllByType(Image)[0]);

    // Assert
    expect(mockedBack).toHaveBeenCalledTimes(1);
  });

  it("navega para o detalhe do produto ao pressionar um card", () => {
    // Arrange
    render(<ShopkeeperShopScreen />);

    // Act
    fireEvent.press(screen.getByText("Guia turístico"));

    // Assert
    expect(mockedPush).toHaveBeenCalledWith({
      pathname: "/user/(private)/shop/product",
      params: { id: 10 },
    });
  });
});
