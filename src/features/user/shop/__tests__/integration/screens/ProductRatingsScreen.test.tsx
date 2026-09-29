import { render, screen } from "@testing-library/react-native";
import { ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ProductRatingsScreen from "@/src/features/user/shop/screens/ProductRatingsScreen";
import { useProductRatings } from "@/src/features/user/shop/hooks/products/useProductRatings";
import {
  productRating,
  productRatingMinimal,
} from "@/src/features/user/shop/__tests__/fixtures/productRatings";

jest.mock("expo-router", () => ({
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

jest.mock("@/src/features/user/shop/components/Header", () => {
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: () => <View testID="header" />,
  };
});

jest.mock("@/src/features/user/shop/hooks/products/useProductRatings", () => ({
  getAverageRating: (ratings: { rating: number }[]) =>
    ratings.length === 0
      ? 0
      : ratings.reduce((sum, item) => sum + item.rating, 0) / ratings.length,
  useProductRatings: jest.fn(),
}));

const mockedUseLocalSearchParams = useLocalSearchParams as jest.MockedFunction<
  typeof useLocalSearchParams
>;

const mockedUseProductRatings = useProductRatings as jest.MockedFunction<
  typeof useProductRatings
>;

describe("ProductRatingsScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useSafeAreaInsets as jest.Mock).mockReturnValue({ top: 0, bottom: 0, left: 0, right: 0 });
    mockedUseLocalSearchParams.mockReturnValue({ id: "10" } as any);
  });

  it("mostra o indicador de carregamento enquanto busca as avaliações", () => {
    // Arrange
    mockedUseProductRatings.mockReturnValue({ isLoading: true } as any);

    // Act
    render(<ProductRatingsScreen />);

    // Assert
    expect(screen.getByTestId("header")).toBeTruthy();
    expect(screen.UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  it("exibe o resumo e todos os itens de avaliação", async () => {
    // Arrange
    mockedUseProductRatings.mockReturnValue({
      data: [productRating, productRatingMinimal],
      isLoading: false,
    } as any);

    // Act
    render(<ProductRatingsScreen />);

    // Assert
    expect(screen.getByText("Opiniões")).toBeTruthy();
    expect(screen.getByText("4.0")).toBeTruthy();
    expect(screen.getByText("2 avaliações")).toBeTruthy();
    expect(screen.getByText("Muito saborosa e crocante!")).toBeTruthy();
    expect(screen.getByText("Pedido #A3F92")).toBeTruthy();
    expect(screen.getByText("Pedido #B7C21")).toBeTruthy();
  });

  it("mostra a mensagem de vazio quando não há avaliações", () => {
    // Arrange
    mockedUseProductRatings.mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    // Act
    render(<ProductRatingsScreen />);

    // Assert
    expect(screen.getByText("Este produto ainda não possui avaliações.")).toBeTruthy();
  });
});