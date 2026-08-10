import { fireEvent, render, screen } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import GlobalShopScreen from "@/src/features/user/shop/screens/GlobalShopScreen";
import { useTouristMe } from "@/src/features/user/auth/hooks/useTouristMe";
import { useAllCategories } from "@/src/features/category/hooks/useAllCategories";
import { useAllProducts } from "@/src/features/user/shop/hooks/products/useAllProducts";
import { useCategoryProducts } from "@/src/features/user/shop/hooks/categories/useCategoryProducts";
import {
  categoryProducts,
  products,
} from "@/src/features/user/shop/__tests__/fixtures/shop";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("expo-navigation-bar", () => ({
  setButtonStyleAsync: jest.fn(),
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

jest.mock("@/src/features/category/hooks/useAllCategories", () => ({
  useAllCategories: jest.fn(),
}));

jest.mock("@/src/features/user/shop/hooks/products/useAllProducts", () => ({
  useAllProducts: jest.fn(),
}));

jest.mock(
  "@/src/features/user/shop/hooks/categories/useCategoryProducts",
  () => ({
    useCategoryProducts: jest.fn(),
  })
);

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockedUseSafeAreaInsets = useSafeAreaInsets as jest.MockedFunction<
  typeof useSafeAreaInsets
>;
const mockedUseTouristMe = useTouristMe as jest.MockedFunction<typeof useTouristMe>;
const mockedUseAllCategories = useAllCategories as jest.MockedFunction<
  typeof useAllCategories
>;
const mockedUseAllProducts = useAllProducts as jest.MockedFunction<typeof useAllProducts>;
const mockedUseCategoryProducts = useCategoryProducts as jest.MockedFunction<
  typeof useCategoryProducts
>;
const mockedPush = jest.fn();

const categories = [{ id: 3, name: "Café" }];

const user = { id: 1, name: "Turista Teste", currentXP: 120 };

describe("GlobalShopScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseRouter.mockReturnValue({ push: mockedPush } as unknown as ReturnType<
      typeof useRouter
    >);
    mockedUseSafeAreaInsets.mockReturnValue({
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    });
    mockedUseTouristMe.mockReturnValue({ data: user } as any);
    mockedUseAllCategories.mockReturnValue({ data: categories } as any);
    mockedUseAllProducts.mockReturnValue({
      data: products,
      isLoading: false,
    } as any);
    mockedUseCategoryProducts.mockReturnValue({
      data: categoryProducts,
      isLoading: false,
    } as any);
  });

  it("renderiza o header com o título e o saldo de XP", () => {
    // Arrange
    render(<GlobalShopScreen />);

    // Assert
    expect(screen.getByText("Loja global")).toBeTruthy();
    expect(screen.getByText("SEU SALDO DE XP")).toBeTruthy();
    expect(screen.getByText("120 XP")).toBeTruthy();
  });

  it("mostra os produtos de TODOS por padrão", () => {
    // Arrange
    render(<GlobalShopScreen />);

    // Assert
    expect(screen.getByText("Café especial")).toBeTruthy();
  });

  it("renderiza as categorias disponíveis", () => {
    // Arrange
    render(<GlobalShopScreen />);

    // Assert
    expect(screen.getByText("TODOS")).toBeTruthy();
    expect(screen.getByText("Café")).toBeTruthy();
  });

  it("troca para os produtos da categoria ao pressionar a categoria", () => {
    // Arrange
    render(<GlobalShopScreen />);

    // Act
    fireEvent.press(screen.getByText("Café"));

    // Assert
    expect(screen.getByText("Capuccino especial")).toBeTruthy();
    expect(screen.queryByText("Café especial")).toBeNull();
  });

  it("volta para TODOS ao pressionar a categoria TODOS", () => {
    // Arrange
    render(<GlobalShopScreen />);

    // Act
    fireEvent.press(screen.getByText("Café"));
    fireEvent.press(screen.getByText("TODOS"));

    // Assert
    expect(screen.getByText("Café especial")).toBeTruthy();
    expect(screen.queryByText("Capuccino especial")).toBeNull();
  });

  it("mostra o empty state de TODOS quando não há produtos", () => {
    // Arrange
    mockedUseAllProducts.mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    // Act
    render(<GlobalShopScreen />);

    // Assert
    expect(
      screen.getByText("Ainda não há produtos cadastrados na plataforma.")
    ).toBeTruthy();
  });

  it("mostra o empty state da categoria quando ela não tem produtos", () => {
    // Arrange
    mockedUseCategoryProducts.mockReturnValue({
      data: {
        ...categoryProducts,
        products: { ...categoryProducts.products, content: [] },
      },
      isLoading: false,
    } as any);

    // Act
    render(<GlobalShopScreen />);
    fireEvent.press(screen.getByText("Café"));

    // Assert
    expect(
      screen.getByText("Nenhum produto encontrado nessa categoria.")
    ).toBeTruthy();
  });

  it("navega para o detalhe do produto ao pressionar um card", () => {
    // Arrange
    render(<GlobalShopScreen />);

    // Act
    fireEvent.press(screen.getByText("Café especial"));

    // Assert
    expect(mockedPush).toHaveBeenCalledWith({
      pathname: "/user/(private)/shop/product",
      params: { id: 1 },
    });
  });
});
