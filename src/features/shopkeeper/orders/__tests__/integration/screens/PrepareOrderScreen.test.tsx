import { ActivityIndicator } from "react-native";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import PrepareOrderScreen from "@/src/features/shopkeeper/orders/screens/PrepareOrderScreen";
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

describe("PrepareOrderScreen", () => {
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
    render(<PrepareOrderScreen />);

    // Assert
    expect(screen.UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  it("mostra erro e volta ao tocar em Voltar", () => {
    // Arrange
    mockOrderState({ data: undefined, isError: true });
    render(<PrepareOrderScreen />);

    // Act
    fireEvent.press(screen.getByText("Voltar"));

    // Assert
    expect(screen.getByText("Pedido não encontrado")).toBeTruthy();
    expect(mockedBack).toHaveBeenCalled();
  });

  it("renderiza o header e o nome do produto", () => {
    // Arrange
    mockOrderState();
    render(<PrepareOrderScreen />);

    // Act
    const title = screen.getByText("Detalhes do Pedido");
    const product = screen.getAllByText("Café especial");

    // Assert
    expect(title).toBeTruthy();
    expect(product.length).toBeGreaterThan(0);
  });

  it("exibe o badge de status Pendente para AWAIT_PAYMENT", () => {
    // Arrange
    mockOrderState();
    render(<PrepareOrderScreen />);

    // Act
    const badge = screen.getByText("Pendente");

    // Assert
    expect(badge).toBeTruthy();
  });

  it("exibe o badge de status Concluído para COMPLETED", () => {
    // Arrange
    mockOrderState({ data: orderDetailWithPickup });
    render(<PrepareOrderScreen />);

    // Act
    const badge = screen.getByText("Concluído");

    // Assert
    expect(badge).toBeTruthy();
  });

  it("mostra o texto de solicitação com o tempo relativo", () => {
    // Arrange
    mockOrderState();
    render(<PrepareOrderScreen />);

    // Act
    const solicitation = screen.getByText("Solicitado há 5 min");

    // Assert
    expect(solicitation).toBeTruthy();
  });

  it("renderiza o item do pedido e o total formatado", () => {
    // Arrange
    mockOrderState();
    render(<PrepareOrderScreen />);

    // Act
    const section = screen.getByText("Item do Pedido");
    const quantity = screen.getByText("x2");
    const unitPrice = screen.getByText("R$ 19,90");
    const total = screen.getByText("Total: R$ 39,80");

    // Assert
    expect(section).toBeTruthy();
    expect(quantity).toBeTruthy();
    expect(unitPrice).toBeTruthy();
    expect(total).toBeTruthy();
  });

  it("mostra mensagem quando o código de retirada ainda não está disponível", () => {
    // Arrange
    mockOrderState();
    render(<PrepareOrderScreen />);

    // Act
    const message = screen.getByText(
      "Código de retirada disponível após a confirmação do pagamento"
    );

    // Assert
    expect(message).toBeTruthy();
  });

  it("mostra o código do cliente quando o pedido foi confirmado", () => {
    // Arrange
    mockOrderState({ data: orderDetailWithPickup });
    render(<PrepareOrderScreen />);

    // Act
    const label = screen.getByText("Código do Cliente");
    const code = screen.getByText("#AB1020");
    const hint = screen.getByText("Peça esse código ao cliente na retirada");

    // Assert
    expect(label).toBeTruthy();
    expect(code).toBeTruthy();
    expect(hint).toBeTruthy();
  });

  it("renderiza os passos do status do pedido", () => {
    // Arrange
    mockOrderState();
    render(<PrepareOrderScreen />);

    // Act
    const awaiting = screen.getByText("Aguardando Pagamento");
    const ready = screen.getByText("Pronto para Retirada");

    // Assert
    expect(awaiting).toBeTruthy();
    expect(ready).toBeTruthy();
  });

  it("não lança com pedido confirmado nos passos de status", () => {
    // Arrange
    mockOrderState({ data: orderDetailWithPickup });
    render(<PrepareOrderScreen />);

    // Act
    const awaiting = screen.getByText("Aguardando Pagamento");
    const ready = screen.getByText("Pronto para Retirada");

    // Assert
    expect(awaiting).toBeTruthy();
    expect(ready).toBeTruthy();
  });

  it("volta ao tocar no botão chevron de voltar", () => {
    // Arrange
    mockOrderState();
    render(<PrepareOrderScreen />);

    // Act
    fireEvent.press(screen.getByText("ionicon-chevron-back"));

    // Assert
    expect(mockedBack).toHaveBeenCalled();
  });
});