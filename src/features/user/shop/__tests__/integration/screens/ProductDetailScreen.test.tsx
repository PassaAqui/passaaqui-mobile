import { fireEvent, render, screen } from "@testing-library/react-native";
import { View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ProductDetailScreen from "@/src/features/user/shop/screens/ProductDetailScreen";
import { useTouristMe } from "@/src/features/user/auth/hooks/useTouristMe";
import { useProductDetail } from "@/src/features/user/shop/hooks/products/useProductDetail";
import { useRedemptionCheck } from "@/src/hooks/user/map/shop/useRedemptionCheck";
import { productDetail } from "@/src/features/user/shop/__tests__/fixtures/shop";

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

jest.mock("@/src/features/user/shop/components/Header", () => {
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: () => <View testID="header" />,
  };
});

jest.mock("@/src/features/user/shop/components/ProductImageCarousel", () => {
  const { View } = require("react-native");
  return {
    ProductImageCarousel: () => <View testID="carousel" />,
  };
});

jest.mock("@/src/features/user/auth/hooks/useTouristMe", () => ({
  useTouristMe: jest.fn(),
}));

jest.mock("@/src/features/user/shop/hooks/products/useProductDetail", () => ({
  useProductDetail: jest.fn(),
}));

jest.mock("@/src/hooks/user/map/shop/useRedemptionCheck", () => ({
  useRedemptionCheck: jest.fn(),
}));

const mockedUseLocalSearchParams = useLocalSearchParams as jest.MockedFunction<
  typeof useLocalSearchParams
>;
const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockedUseSafeAreaInsets = useSafeAreaInsets as jest.MockedFunction<
  typeof useSafeAreaInsets
>;
const mockedUseTouristMe = useTouristMe as jest.MockedFunction<typeof useTouristMe>;
const mockedUseProductDetail = useProductDetail as jest.MockedFunction<
  typeof useProductDetail
>;
const mockedUseRedemptionCheck = useRedemptionCheck as jest.MockedFunction<
  typeof useRedemptionCheck
>;
const mockedPush = jest.fn();
const mockedSetRedeemed = jest.fn();

describe("ProductDetailScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseLocalSearchParams.mockReturnValue({ id: "5" });
    mockedUseRouter.mockReturnValue({ push: mockedPush } as unknown as ReturnType<
      typeof useRouter
    >);
    mockedUseSafeAreaInsets.mockReturnValue({
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    });
    mockedUseProductDetail.mockReturnValue({ data: productDetail } as any);
    mockedUseRedemptionCheck.mockReturnValue({
      hasRedeemed: false,
      setRedeemed: mockedSetRedeemed,
    } as any);
    mockedUseTouristMe.mockReturnValue({ data: { currentXP: 120 } } as any);
  });

  it("renderiza null quando não há produto", () => {
    // Arrange
    mockedUseProductDetail.mockReturnValue({ data: undefined } as any);

    // Act
    render(<ProductDetailScreen />);

    // Assert
    expect(screen.queryByText("Resgatar")).toBeNull();
  });

  it("renderiza as informações principais do produto", () => {
    // Arrange
    mockedUseTouristMe.mockReturnValue({ data: { currentXP: 120 } } as any);

    // Act
    render(<ProductDetailScreen />);

    // Assert
    expect(screen.getByText("Café especial")).toBeTruthy();
    expect(screen.getByText("Marco Zero - Recife PE")).toBeTruthy();
    expect(screen.getByText("Café")).toBeTruthy();
    expect(screen.getByText("4.8 (120 avaliações)")).toBeTruthy();
    expect(screen.getByText("Café torrado artesanalmente")).toBeTruthy();
  });

  it("renderiza a seção de detalhes do desconto", () => {
    // Arrange
    mockedUseTouristMe.mockReturnValue({ data: { currentXP: 120 } } as any);

    // Act
    render(<ProductDetailScreen />);

    // Assert
    expect(screen.getByText("DETALHES DO DESCONTO")).toBeTruthy();
    expect(screen.getByText("Valor do desconto")).toBeTruthy();
    expect(screen.getByText("- R$ 5,00")).toBeTruthy();
    expect(screen.getByText("Validade")).toBeTruthy();
    expect(screen.getByText("30 dias após o resgate")).toBeTruthy();
    expect(screen.getByText("Uso")).toBeTruthy();
    expect(screen.getByText("1 vez por resgate")).toBeTruthy();
  });

  it("navega para o pagamento quando canRescue é true", () => {
    // Arrange
    mockedUseTouristMe.mockReturnValue({ data: { currentXP: 120 } } as any);

    // Act
    render(<ProductDetailScreen />);
    fireEvent.press(screen.getByText("Resgatar"));

    // Assert
    expect(mockedPush).toHaveBeenCalledWith({
      pathname: "/user/(private)/payment",
      params: { id: productDetail.id, discount: 5 },
    });
  });

  it("desabilita o botão e não navega nem marca resgatado quando canRescue é false", () => {
    // Arrange
    mockedUseTouristMe.mockReturnValue({ data: { currentXP: 10 } } as any);

    // Act
    render(<ProductDetailScreen />);
    fireEvent.press(screen.getByText("Resgatar"));

    // Assert
    expect(mockedSetRedeemed).not.toHaveBeenCalled();
    expect(mockedPush).not.toHaveBeenCalled();
    expect(
      screen.getByText("Você precisa de mais 20 XP para resgatar esse item")
    ).toBeTruthy();
  });

  it("mostra o texto de confirmação quando canRescue é true", () => {
    // Arrange
    mockedUseTouristMe.mockReturnValue({ data: { currentXP: 120 } } as any);

    // Act
    render(<ProductDetailScreen />);

    // Assert
    expect(
      screen.getByText("Ao resgatar, 30 XP serão debitados do seu saldo")
    ).toBeTruthy();
  });

  it("abre o modal de resgate pendente quando hasRedeemed é true", () => {
    // Arrange
    mockedUseTouristMe.mockReturnValue({ data: { currentXP: 120 } } as any);
    mockedUseRedemptionCheck.mockReturnValue({
      hasRedeemed: true,
      setRedeemed: mockedSetRedeemed,
    } as any);

    // Act
    render(<ProductDetailScreen />);

    // Assert
    expect(screen.getByText("Resgate Pendente")).toBeTruthy();

    // Act
    fireEvent.press(screen.getByText("Agora não"));

    // Assert
    expect(mockedSetRedeemed).toHaveBeenCalledWith(false);
  });
});
