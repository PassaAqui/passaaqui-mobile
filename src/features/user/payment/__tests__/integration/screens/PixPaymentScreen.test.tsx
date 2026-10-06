import { ActivityIndicator, Image } from "react-native";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ClipBoard from "expo-clipboard";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PixPaymentScreen from "@/src/features/user/payment/screens/PixPaymentScreen";
import { useOrder } from "@/src/features/user/payment/hooks/useOrder";
import { useOrderSocket } from "@/src/features/user/payment/hooks/useOrderSocket";
import { useOrderStore } from "@/src/stores/user/payment/orderStore";
import {
  order,
  expiredOrder,
  orderStatusUpdate,
} from "@/src/features/user/payment/__tests__/fixtures/payment";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
}));

jest.mock("expo-clipboard", () => ({
  setStringAsync: jest.fn(),
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

jest.mock("@/src/features/user/payment/hooks/useOrder", () => ({
  useOrder: jest.fn(),
}));

jest.mock("@/src/features/user/payment/hooks/useOrderSocket", () => ({
  useOrderSocket: jest.fn(),
}));

const mockedUseLocalSearchParams = useLocalSearchParams as jest.MockedFunction<
  typeof useLocalSearchParams
>;
const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockedUseSafeAreaInsets = useSafeAreaInsets as jest.MockedFunction<
  typeof useSafeAreaInsets
>;
const mockedUseOrder = useOrder as jest.MockedFunction<typeof useOrder>;
const mockedUseOrderSocket = useOrderSocket as jest.MockedFunction<
  typeof useOrderSocket
>;
const mockedPush = jest.fn();
const mockedReplace = jest.fn();
const mockedSetStringAsync = ClipBoard.setStringAsync as jest.MockedFunction<
  typeof ClipBoard.setStringAsync
>;

describe("PixPaymentScreen", () => {
  let socketStatusCallback: ((data: typeof orderStatusUpdate) => void) | null;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-08-10T00:05:00.000Z"));
    jest.clearAllMocks();
    useOrderStore.setState({ order: null });
    socketStatusCallback = null;
    mockedUseLocalSearchParams.mockReturnValue({ orderId: "ord-1" });
    mockedUseRouter.mockReturnValue({
      push: mockedPush,
      replace: mockedReplace,
    } as unknown as ReturnType<typeof useRouter>);
    mockedUseSafeAreaInsets.mockReturnValue({
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    });
    mockedUseOrder.mockReturnValue({ data: undefined, isLoading: false } as any);
    mockedUseOrderSocket.mockImplementation(
      (_orderId: string | undefined, onStatusChange?: (data: any) => void) => {
        socketStatusCallback = onStatusChange ?? null;
      }
    );
    mockedSetStringAsync.mockResolvedValue(true);
  });

  afterEach(() => {
    useOrderStore.setState({ order: null });
    jest.useRealTimers();
  });

  function findQrImage() {
    return screen
      .UNSAFE_getAllByType(Image)
      .find(
        (img) =>
          typeof img.props.source === "object" &&
          img.props.source?.uri === "data:image/png;base64,base64-seed"
      );
  }

  it("mostra ActivityIndicator em loading enquanto busca o pedido", () => {
    // Arrange
    mockedUseOrder.mockReturnValue({ data: undefined, isLoading: true } as any);

    // Act
    render(<PixPaymentScreen />);

    // Assert
    expect(screen.UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
    expect(screen.queryByText("Aguardando pagamento")).toBeNull();
  });

  it("mostra ActivityIndicator quando não há pedido no store nem da query", () => {
    // Act
    render(<PixPaymentScreen />);

    // Assert
    expect(screen.UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
    expect(screen.queryByText("Aguardando pagamento")).toBeNull();
  });

  it("renderiza o PIX com QR Code, código e contagem regressiva", () => {
    // Arrange
    useOrderStore.setState({ order });

    // Act
    render(<PixPaymentScreen />);

    // Assert
    expect(screen.getByText("Aguardando pagamento")).toBeTruthy();
    expect(screen.getByText("Finalize o PIX para confirmar seu pedido")).toBeTruthy();
    expect(findQrImage()).toBeTruthy();
    expect(
      screen.getByText("Copie o código abaixo para pagar no app do seu banco:")
    ).toBeTruthy();
    expect(screen.getByText(order.pix)).toBeTruthy();
    expect(screen.getByText(/O código expira em:/)).toBeTruthy();
    expect(screen.getByText(/\d{2}:\d{2}/)).toBeTruthy();
  });

  it("atualiza a contagem regressiva a cada segundo", () => {
    // Arrange
    useOrderStore.setState({ order });

    // Act
    render(<PixPaymentScreen />);
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Assert
    expect(screen.getByText("04:59")).toBeTruthy();
  });

  it("mostra Código expirado quando o pedido expira", () => {
    // Arrange
    useOrderStore.setState({ order: expiredOrder });

    // Act
    render(<PixPaymentScreen />);

    // Assert
    expect(screen.getByText("Código expirado")).toBeTruthy();
    expect(screen.getByText("Expirado")).toBeTruthy();
  });

  it("copia o código PIX e mostra Copiado", async () => {
    // Arrange
    useOrderStore.setState({ order });

    // Act
    render(<PixPaymentScreen />);
    fireEvent.press(screen.getByText("Copiar código PIX"));
    await act(async () => {});

    // Assert
    expect(mockedSetStringAsync).toHaveBeenCalledWith(order.pix);
    expect(screen.getByText("Copiado")).toBeTruthy();

    // Act — reverte após 7s
    act(() => {
      jest.advanceTimersByTime(7000);
    });

    // Assert
    expect(screen.getByText("Copiar código PIX")).toBeTruthy();
  });

  it("redireciona para a confirmação quando o socket recebe status PAID", () => {
    // Arrange
    useOrderStore.setState({ order });

    // Act
    render(<PixPaymentScreen />);
    act(() => {
      socketStatusCallback?.(orderStatusUpdate);
    });

    // Assert
    expect(mockedReplace).toHaveBeenCalledWith(
      "/user/(private)/payment/payment-confirmed"
    );
  });

  it("volta à loja ao pressionar Voltar à loja", () => {
    // Arrange
    useOrderStore.setState({ order });

    // Act
    render(<PixPaymentScreen />);
    fireEvent.press(screen.getByText("Voltar à loja"));

    // Assert
    expect(mockedPush).toHaveBeenCalledWith({
      pathname: "/user/(private)/shop/product",
      params: { id: order.productId },
    });
  });
});