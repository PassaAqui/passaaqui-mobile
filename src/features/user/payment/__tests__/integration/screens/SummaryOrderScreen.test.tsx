import { Alert, View } from "react-native";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SummaryOrderScreen from "@/src/features/user/payment/screens/SummaryOrderScreen";
import { useCheckout } from "@/src/features/user/payment/hooks/useCheckout";
import { useOrderStore } from "@/src/stores/user/payment/orderStore";
import { useTouristMe } from "@/src/features/user/auth/hooks/useTouristMe";
import { useProductDetail } from "@/src/features/user/shop/hooks/products/useProductDetail";
import { productDetail } from "@/src/features/user/shop/__tests__/fixtures/shop";
import {
  order,
  createAxiosError,
} from "@/src/features/user/payment/__tests__/fixtures/payment";

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

jest.mock("@/src/features/user/auth/hooks/useTouristMe", () => ({
  useTouristMe: jest.fn(),
}));

jest.mock("@/src/features/user/shop/hooks/products/useProductDetail", () => ({
  useProductDetail: jest.fn(),
}));

jest.mock("@/src/features/user/payment/hooks/useCheckout", () => ({
  useCheckout: jest.fn(),
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
const mockedUseCheckout = useCheckout as jest.MockedFunction<typeof useCheckout>;
const mockedPush = jest.fn();
const alertSpy = jest.spyOn(Alert, "alert");

describe("SummaryOrderScreen", () => {
  let mutate: jest.Mock;
  let savedCallbacks: {
    onSuccess?: (data: typeof order) => void;
    onError?: (error: any) => void;
  } | null;

  beforeEach(() => {
    jest.clearAllMocks();
    useOrderStore.setState({ order: null });
    savedCallbacks = null;
    mutate = jest.fn((_id: number, callbacks?: any) => {
      savedCallbacks = callbacks ?? null;
    });
    mockedUseLocalSearchParams.mockReturnValue({ id: "1" });
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
    mockedUseTouristMe.mockReturnValue({ data: { currentXP: 120 } } as any);
    mockedUseCheckout.mockReturnValue({ mutate, isPending: false } as any);
  });

  afterEach(() => {
    useOrderStore.setState({ order: null });
  });

  it("renderiza null quando não há produto", () => {
    // Arrange
    mockedUseProductDetail.mockReturnValue({ data: undefined } as any);

    // Act
    render(<SummaryOrderScreen />);

    // Assert
    expect(screen.queryByText("RESUMO DO PEDIDO")).toBeNull();
    expect(screen.queryByText("Pagar com PIX")).toBeNull();
  });

  it("renderiza o resumo do pedido com valores formatados", () => {
    // Act
    render(<SummaryOrderScreen />);

    // Assert
    expect(screen.getByText("RESUMO DO PEDIDO")).toBeTruthy();
    expect(screen.getByText("Café especial")).toBeTruthy();
    expect(screen.getByText("Marco Zero")).toBeTruthy();
    expect(screen.getAllByText("R$ 19,90").length).toBe(2);
    expect(screen.getByText("XP USADO")).toBeTruthy();
    expect(screen.getByText("120 XP")).toBeTruthy();
    expect(screen.getByText("30 XP aplicados")).toBeTruthy();
    expect(screen.getByText("MÉTODO DE PAGAMENTO")).toBeTruthy();
    expect(screen.getByText("PIX")).toBeTruthy();
    expect(screen.getByText("Pagamento instantâneo")).toBeTruthy();
    expect(screen.getByText("TOTAL")).toBeTruthy();
    expect(screen.getByText("Subtotal")).toBeTruthy();
    expect(screen.getByText("Desconto XP")).toBeTruthy();
    expect(screen.getAllByText("- R$ 5,00 (MOCKADO)").length).toBe(2);
    expect(screen.getByText("R$ 14,90 (MOCKADO)")).toBeTruthy();
    expect(screen.getByText("Pagar com PIX")).toBeTruthy();
    expect(
      screen.getByText("Você será redirecionado para o QR Code do PIX")
    ).toBeTruthy();
  });

  it("mostra Gerando PIX e ActivityIndicator quando isPending é true", () => {
    // Arrange
    mockedUseCheckout.mockReturnValue({ mutate, isPending: true } as any);

    // Act
    render(<SummaryOrderScreen />);

    // Assert
    expect(screen.getByText("Gerando PIX...")).toBeTruthy();
    expect(screen.queryByText("Pagar com PIX")).toBeNull();
  });

  it("navega para o PIX após pagar com sucesso", () => {
    // Act
    render(<SummaryOrderScreen />);
    fireEvent.press(screen.getByText("Pagar com PIX"));

    // Assert
    expect(mutate).toHaveBeenCalledWith(1, expect.anything());

    // Act — simula o onSuccess do checkout
    act(() => {
      savedCallbacks?.onSuccess?.(order);
    });

    // Assert
    expect(mockedPush).toHaveBeenCalledWith({
      pathname: "/user/(private)/payment/pix-payment",
      params: { orderId: order.id },
    });
  });

  it("abre o modal de resgate pendente no erro 409 e fecha com Agora não", () => {
    // Act
    render(<SummaryOrderScreen />);
    fireEvent.press(screen.getByText("Pagar com PIX"));
    act(() => {
      savedCallbacks?.onError?.(createAxiosError(409));
    });

    // Assert
    expect(screen.getByText("Resgate Pendente")).toBeTruthy();
    expect(alertSpy).not.toHaveBeenCalled();

    // Act — fecha o modal
    fireEvent.press(screen.getByText("Agora não"));

    // Assert
    expect(screen.queryByText("Resgate Pendente")).toBeNull();
  });

  it("exibe Alert de erro no status 400", () => {
    // Act
    render(<SummaryOrderScreen />);
    fireEvent.press(screen.getByText("Pagar com PIX"));
    act(() => {
      savedCallbacks?.onError?.(createAxiosError(400));
    });

    // Assert
    expect(alertSpy).toHaveBeenCalledWith(
      "Erro",
      "Produto sem estoque disponível ou dados inválidos."
    );
  });

  it("exibe Alert de erro genérico em falha inesperada", () => {
    // Arrange
    const error = createAxiosError(500);

    // Act
    render(<SummaryOrderScreen />);
    fireEvent.press(screen.getByText("Pagar com PIX"));
    act(() => {
      savedCallbacks?.onError?.(error);
    });

    // Assert
    expect(alertSpy).toHaveBeenCalledWith(
      "Erro",
      "Não foi possível gerar o pedido. Tente novamente."
    );
  });
});