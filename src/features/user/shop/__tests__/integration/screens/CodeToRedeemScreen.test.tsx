import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import { useRouter } from "expo-router";
import * as ClipBoard from "expo-clipboard";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CodeToRedeemScreen from "@/src/features/user/shop/screens/CodeToRedeemScreen";
import { usePendingOrder } from "@/src/features/user/payment/hooks/usePendingOrder";
import { useProductDetail } from "@/src/features/user/shop/hooks/products/useProductDetail";
import { pendingOrder } from "@/src/features/user/payment/__tests__/fixtures/payment";
import { productDetail } from "@/src/features/user/shop/__tests__/fixtures/shop";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("expo-clipboard", () => ({
  setStringAsync: jest.fn(),
}));

jest.mock("@/src/features/user/payment/hooks/usePendingOrder", () => ({
  usePendingOrder: jest.fn(),
}));

jest.mock(
  "@/src/features/user/shop/hooks/products/useProductDetail",
  () => ({
    useProductDetail: jest.fn(),
  })
);

jest.mock("react-native-safe-area-context", () => {
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

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockedUsePendingOrder = usePendingOrder as jest.MockedFunction<
  typeof usePendingOrder
>;
const mockedUseProductDetail = useProductDetail as jest.MockedFunction<
  typeof useProductDetail
>;
const mockedSetStringAsync = ClipBoard.setStringAsync as jest.MockedFunction<
  typeof ClipBoard.setStringAsync
>;
const mockedUseSafeAreaInsets = useSafeAreaInsets as jest.MockedFunction<
  typeof useSafeAreaInsets
>;

const mockedBack = jest.fn();
const mockedRefetch = jest.fn();

function mockPendingOrderQuery(
  overrides: Partial<ReturnType<typeof usePendingOrder>> = {}
) {
  mockedUsePendingOrder.mockReturnValue({
    data: pendingOrder,
    isLoading: false,
    isError: false,
    refetch: mockedRefetch,
    ...overrides,
  } as unknown as ReturnType<typeof usePendingOrder>);
}

describe("CodeToRedeemScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseRouter.mockReturnValue({
      back: mockedBack,
    } as unknown as ReturnType<typeof useRouter>);
    mockedUseSafeAreaInsets.mockReturnValue({
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    });
    mockedUseProductDetail.mockReturnValue({
      data: productDetail,
    } as unknown as ReturnType<typeof useProductDetail>);
    mockedSetStringAsync.mockResolvedValue(true);
    mockPendingOrderQuery();
  });

  it("renderiza os dados reais do pedido pendente", () => {
    // Arrange
    render(<CodeToRedeemScreen />);

    // Assert
    expect(screen.getByText("PAGAMENTO PENDENTE")).toBeTruthy();
    expect(screen.getByText(pendingOrder.productName)).toBeTruthy();
    expect(screen.getByText(pendingOrder.shopkeeperName)).toBeTruthy();
    expect(screen.getByText(pendingOrder.pix)).toBeTruthy();
    expect(screen.getByText("R$ 19,90")).toBeTruthy();
    expect(screen.getByText(/Válido até/)).toBeTruthy();
    expect(mockedUseProductDetail).toHaveBeenCalledWith(pendingOrder.productId);
  });

  it("renderiza a imagem real do produto", () => {
    // Arrange
    render(<CodeToRedeemScreen />);

    // Assert
    expect(screen.getByTestId("product-image").props.source).toEqual({
      uri: productDetail.images?.[0],
    });
  });

  it("renderiza o QR Code a partir do base64 do pedido", () => {
    // Arrange
    render(<CodeToRedeemScreen />);

    // Assert
    expect(screen.getByTestId("pix-qr-code").props.source).toEqual({
      uri: "data:image/png;base64,base64-seed",
    });
  });

  it("copia o código PIX e exibe o feedback", async () => {
    // Arrange
    render(<CodeToRedeemScreen />);

    // Act
    fireEvent.press(screen.getByTestId("copy-pix-button"));

    // Assert
    await waitFor(() =>
      expect(mockedSetStringAsync).toHaveBeenCalledWith(pendingOrder.pix)
    );
    expect(screen.getByText("Copiado")).toBeTruthy();
  });

  it("fecha a tela ao pressionar Fechar", () => {
    // Arrange
    render(<CodeToRedeemScreen />);

    // Act
    fireEvent.press(screen.getByText("Fechar"));

    // Assert
    expect(mockedBack).toHaveBeenCalledTimes(1);
  });

  it("remove a seção de códigos usados", () => {
    // Arrange
    render(<CodeToRedeemScreen />);

    // Assert
    expect(screen.queryByText("CÓDIGOS USADOS")).toBeNull();
  });

  it("exibe o estado de carregamento", () => {
    // Arrange
    mockPendingOrderQuery({ data: undefined, isLoading: true });
    render(<CodeToRedeemScreen />);

    // Assert
    expect(screen.getByTestId("pending-order-loading")).toBeTruthy();
  });

  it("exibe o estado vazio quando não há pagamento pendente", () => {
    // Arrange
    mockPendingOrderQuery({ data: null });
    render(<CodeToRedeemScreen />);

    // Assert
    expect(screen.getByText("Nenhum pagamento pendente")).toBeTruthy();
    expect(
      screen.getByText("Você não possui nenhum PIX aguardando pagamento.")
    ).toBeTruthy();
  });

  it("volta ao pressionar Voltar no estado vazio", () => {
    // Arrange
    mockPendingOrderQuery({ data: null });
    render(<CodeToRedeemScreen />);

    // Act
    fireEvent.press(screen.getByText("Voltar"));

    // Assert
    expect(mockedBack).toHaveBeenCalledTimes(1);
  });

  it("exibe o estado de erro e permite tentar novamente", () => {
    // Arrange
    mockPendingOrderQuery({
      data: undefined,
      isLoading: false,
      isError: true,
    });
    render(<CodeToRedeemScreen />);

    // Assert
    expect(
      screen.getByText("Não foi possível carregar seu pagamento")
    ).toBeTruthy();

    // Act
    fireEvent.press(screen.getByText("Tentar novamente"));

    // Assert
    expect(mockedRefetch).toHaveBeenCalledTimes(1);
  });

  it("exibe PIX expirado e desabilita a cópia", () => {
    // Arrange
    mockPendingOrderQuery({
      data: { ...pendingOrder, pixExpiresAt: "2020-01-01T00:00:00.000Z" },
    });
    render(<CodeToRedeemScreen />);

    // Assert
    expect(screen.getAllByText("PIX expirado").length).toBeGreaterThanOrEqual(
      2
    );

    // Act
    fireEvent.press(screen.getByTestId("copy-pix-button"));

    // Assert
    expect(mockedSetStringAsync).not.toHaveBeenCalled();
  });

  it("exibe fallback quando o QR Code não está disponível", () => {
    // Arrange
    mockPendingOrderQuery({
      data: { ...pendingOrder, qrCodeBase64: "" },
    });
    render(<CodeToRedeemScreen />);

    // Assert
    expect(screen.getByText("QR Code indisponível")).toBeTruthy();
    expect(screen.queryByTestId("pix-qr-code")).toBeNull();
  });
});
