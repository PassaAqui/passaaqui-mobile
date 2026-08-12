import { View } from "react-native";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PaymentConfirmedScreen from "@/src/features/user/payment/screens/PaymentConfirmedScreen";
import { useOrderStore } from "@/src/stores/user/payment/orderStore";
import {
  order,
  paidOrder,
} from "@/src/features/user/payment/__tests__/fixtures/payment";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
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

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockedUseSafeAreaInsets = useSafeAreaInsets as jest.MockedFunction<
  typeof useSafeAreaInsets
>;
const mockedPush = jest.fn();

describe("PaymentConfirmedScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useOrderStore.setState({ order: null });
    mockedUseRouter.mockReturnValue({ push: mockedPush } as unknown as ReturnType<
      typeof useRouter
    >);
    mockedUseSafeAreaInsets.mockReturnValue({
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    });
  });

  it("renderiza null quando não há pedido no store", () => {
    // Act
    render(<PaymentConfirmedScreen />);

    // Assert
    expect(screen.queryByText("Pagamento confirmado!")).toBeNull();
    expect(screen.queryByText("RESUMO DO PEDIDO")).toBeNull();
  });

  it("renderiza o resumo do pedido confirmado", () => {
    // Arrange
    useOrderStore.setState({ order: paidOrder });

    // Act
    render(<PaymentConfirmedScreen />);

    // Assert
    expect(screen.getByText("Pagamento confirmado!")).toBeTruthy();
    expect(screen.getByText("PIX processado com sucesso")).toBeTruthy();
    expect(screen.getByText("RESUMO DO PEDIDO")).toBeTruthy();
    expect(screen.getByText("Café especial")).toBeTruthy();
    expect(screen.getByText("Café do Recife")).toBeTruthy();
    expect(screen.getByText("R$ 19,90")).toBeTruthy();
  });

  it("mostra o código de retirada quando o pedido possui pickupCode", () => {
    // Arrange
    useOrderStore.setState({ order: paidOrder });

    // Act
    render(<PaymentConfirmedScreen />);

    // Assert
    expect(screen.getByText(/Código de retirada:/)).toBeTruthy();
    expect(screen.getByText("AB1020")).toBeTruthy();
  });

  it("não mostra o código de retirada quando pickupCode é null", () => {
    // Arrange
    useOrderStore.setState({ order });

    // Act
    render(<PaymentConfirmedScreen />);

    // Assert
    expect(screen.queryByText(/Código de retirada/)).toBeNull();
  });

  it("limpa o pedido e navega para os resgates ao pressionar Ver meus resgates", () => {
    // Arrange
    useOrderStore.setState({ order: paidOrder });

    // Act
    render(<PaymentConfirmedScreen />);
    fireEvent.press(screen.getByText("Ver meus resgates"));

    // Assert
    expect(useOrderStore.getState().order).toBeNull();
    expect(mockedPush).toHaveBeenCalledWith("/user/(private)/map/(tabs)/purchased");
  });

  it("limpa o pedido e volta à loja ao pressionar Voltar à loja", () => {
    // Arrange
    useOrderStore.setState({ order: paidOrder });

    // Act
    render(<PaymentConfirmedScreen />);
    fireEvent.press(screen.getByText("Voltar à loja"));

    // Assert
    expect(useOrderStore.getState().order).toBeNull();
    expect(mockedPush).toHaveBeenCalledWith("/user/(private)/shop/product");
  });
});