import { ActivityIndicator } from "react-native";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import OrderDetailScreen from "@/src/features/shopkeeper/orders/screens/OrderDetailScreen";
import { useOrderById } from "@/src/features/shopkeeper/orders/hooks/useOrderById";
import {
  FIXED_NOW_ISO,
  orderDetail,
  orderDetailWithPickup,
} from "@/src/features/shopkeeper/orders/__tests__/fixtures/orders";

jest.mock("@/src/features/shopkeeper/orders/hooks/useOrderById", () => ({
  useOrderById: jest.fn(),
}));

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock("@expo/vector-icons", () => {
  const { Text } = require("react-native");
  return {
    Ionicons: (props: { name: string }) => <Text>{`ionicon-${props.name}`}</Text>,
  };
});

const mockedUseOrderById = useOrderById as jest.MockedFunction<typeof useOrderById>;
const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockedUseLocalSearchParams =
  useLocalSearchParams as jest.MockedFunction<typeof useLocalSearchParams>;
const mockedBack = jest.fn();

const FIXED_NOW = new Date(FIXED_NOW_ISO).getTime();

function mockOrderState(
  overrides: Partial<ReturnType<typeof useOrderById>> = {}
) {
  mockedUseOrderById.mockReturnValue({
    data: orderDetail,
    isLoading: false,
    isError: false,
    error: null,
    ...overrides,
  } as unknown as ReturnType<typeof useOrderById>);
}

describe("OrderDetailScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Date, "now").mockReturnValue(FIXED_NOW);
    mockedUseLocalSearchParams.mockReturnValue({ id: "ord-1" });
    mockedUseRouter.mockReturnValue({ back: mockedBack } as unknown as ReturnType<
      typeof useRouter
    >);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("mostra o indicador de loading enquanto carrega", () => {
    // Arrange
    mockOrderState({ data: undefined, isLoading: true });

    // Act
    render(<OrderDetailScreen />);

    // Assert
    expect(screen.UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  it("mostra erro e volta ao tocar em Voltar", () => {
    // Arrange
    mockOrderState({ data: undefined, isError: true });
    render(<OrderDetailScreen />);

    // Act
    fireEvent.press(screen.getByText("Voltar"));

    // Assert
    expect(screen.getByText("Pedido não encontrado")).toBeTruthy();
    expect(mockedBack).toHaveBeenCalled();
  });

  it("renderiza o header, produto, tempo relativo e badge de status", () => {
    // Arrange
    mockOrderState();
    render(<OrderDetailScreen />);

    // Act
    const title = screen.getByText("Pedido");
    const product = screen.getByText("Café especial");
    const time = screen.getByText("Há 5 min");
    const badge = screen.getByText("Pendente");

    // Assert
    expect(title).toBeTruthy();
    expect(product).toBeTruthy();
    expect(time).toBeTruthy();
    expect(badge).toBeTruthy();
  });

  it("mostra mensagem quando o código de retirada ainda não está disponível", () => {
    // Arrange
    mockOrderState();
    render(<OrderDetailScreen />);

    // Act
    const message = screen.getByText(
      "Código de retirada disponível após confirmação do pagamento"
    );

    // Assert
    expect(message).toBeTruthy();
  });

  it("mostra o código de retirada quando o pedido foi confirmado", () => {
    // Arrange
    mockOrderState({ data: orderDetailWithPickup });
    render(<OrderDetailScreen />);

    // Act
    const label = screen.getByText("Código de retirada");
    const code = screen.getByText("#AB1020");
    const badge = screen.getByText("Concluído");

    // Assert
    expect(label).toBeTruthy();
    expect(code).toBeTruthy();
    expect(badge).toBeTruthy();
  });

  it("renderiza o item do pedido e os totais formatados", () => {
    // Arrange
    mockOrderState();
    render(<OrderDetailScreen />);

    // Act
    const section = screen.getByText("Item do pedido");
    const item = screen.getByText("2x Café especial");
    const unitPrice = screen.getByText("R$ 19,90");
    const totalLabel = screen.getByText("Total");
    const total = screen.getByText("R$ 39,80");

    // Assert
    expect(section).toBeTruthy();
    expect(item).toBeTruthy();
    expect(unitPrice).toBeTruthy();
    expect(totalLabel).toBeTruthy();
    expect(total).toBeTruthy();
  });

  it("volta ao tocar no botão de voltar do header", () => {
    // Arrange
    mockOrderState();
    render(<OrderDetailScreen />);

    // Act
    fireEvent.press(screen.getByLabelText("Voltar"));

    // Assert
    expect(mockedBack).toHaveBeenCalled();
  });
});