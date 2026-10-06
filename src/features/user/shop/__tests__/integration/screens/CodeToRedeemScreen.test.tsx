import { render, screen } from "@testing-library/react-native";
import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CodeToRedeemScreen from "@/src/features/user/shop/screens/CodeToRedeemScreen";

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

const mockedUseLocalSearchParams = useLocalSearchParams as jest.MockedFunction<
  typeof useLocalSearchParams
>;
const mockedUseSafeAreaInsets = useSafeAreaInsets as jest.MockedFunction<
  typeof useSafeAreaInsets
>;

describe("CodeToRedeemScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseLocalSearchParams.mockReturnValue({
      img: "https://cdn.example.com/cafe.jpg",
      title: "Café especial",
      discount: "5",
    });
    mockedUseSafeAreaInsets.mockReturnValue({
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    });
  });

  it("renderiza o título CÓDIGO ATIVO", () => {
    // Arrange
    render(<CodeToRedeemScreen />);

    // Assert
    expect(screen.getByText("CÓDIGO ATIVO")).toBeTruthy();
  });

  it("renderiza o título do produto vindo dos parâmetros", () => {
    // Arrange
    render(<CodeToRedeemScreen />);

    // Assert
    expect(screen.getByText("Café especial")).toBeTruthy();
  });

  it("renderiza o código do cupom", () => {
    // Arrange
    render(<CodeToRedeemScreen />);

    // Assert
    expect(screen.getByText("RCFXP05")).toBeTruthy();
  });

  it("renderiza o desconto formatado em pt-BR", () => {
    // Arrange
    render(<CodeToRedeemScreen />);

    // Assert
    expect(screen.getByText("R$5,00.")).toBeTruthy();
  });

  it("renderiza os botões Copiar código e Fechar", () => {
    // Arrange
    render(<CodeToRedeemScreen />);

    // Assert
    expect(screen.getByText("Copiar código")).toBeTruthy();
    expect(screen.getByText("Fechar")).toBeTruthy();
  });
});
