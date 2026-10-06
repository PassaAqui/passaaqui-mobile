import { ActivityIndicator } from "react-native";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import OrdersScreen from "@/src/features/shopkeeper/orders/screens/OrdersScreen";
import { useShopkeeperOrders } from "@/src/features/shopkeeper/orders/hooks/useShopkeeperOrders";
import { apiOrder, apiOrders } from "@/src/features/shopkeeper/orders/__tests__/fixtures/orders";

jest.mock("@/src/features/shopkeeper/orders/hooks/useShopkeeperOrders", () => ({
  useShopkeeperOrders: jest.fn(),
}));

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
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

const mockedUseShopkeeperOrders =
  useShopkeeperOrders as jest.MockedFunction<typeof useShopkeeperOrders>;
const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockedPush = jest.fn();

function mockOrdersState(
  overrides: Partial<ReturnType<typeof useShopkeeperOrders>> = {}
) {
  const refetch = jest.fn();
  mockedUseShopkeeperOrders.mockReturnValue({
    data: apiOrders,
    isLoading: false,
    isError: false,
    error: null,
    refetch,
    ...overrides,
  } as unknown as ReturnType<typeof useShopkeeperOrders>);
  return { refetch };
}

describe("OrdersScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseRouter.mockReturnValue({ push: mockedPush } as unknown as ReturnType<
      typeof useRouter
    >);
  });

  it("mostra o indicador de loading enquanto carrega", () => {
    // Arrange
    mockOrdersState({ data: undefined, isLoading: true });

    // Act
    render(<OrdersScreen />);

    // Assert
    expect(screen.UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
    expect(screen.getByText("Atualizando...")).toBeTruthy();
  });

  it("mostra erro e refaz a busca ao tocar em Tentar novamente", () => {
    // Arrange
    const { refetch } = mockOrdersState({ data: undefined, isError: true });
    render(<OrdersScreen />);

    // Act
    fireEvent.press(screen.getByText("Tentar novamente"));

    // Assert
    expect(screen.getByText("Não foi possível carregar os pedidos")).toBeTruthy();
    expect(refetch).toHaveBeenCalled();
  });

  it("mostra o estado vazio quando não há pedidos", () => {
    // Arrange
    mockOrdersState({ data: [] });
    render(<OrdersScreen />);

    // Act
    const empty = screen.getByText("Nenhum pedido nesta categoria");

    // Assert
    expect(empty).toBeTruthy();
  });

  it("renderiza títulos, abas e contadores dos resumos", () => {
    // Arrange
    mockOrdersState();
    render(<OrdersScreen />);

    // Act
    const title = screen.getByText("Pedidos");
    const tabTodos = screen.getByText("Todos");
    const tabPendente = screen.getAllByText("Pendente")[0];
    const tabConcluido = screen.getAllByText("Concluído")[0];
    const countTodos = screen.getByText("2");
    const countOnes = screen.getAllByText("1");

    // Assert
    expect(title).toBeTruthy();
    expect(tabTodos).toBeTruthy();
    expect(tabPendente).toBeTruthy();
    expect(tabConcluido).toBeTruthy();
    expect(countTodos).toBeTruthy();
    expect(countOnes).toHaveLength(2);
  });

  it("lista os dois pedidos na aba Todos por padrão", () => {
    // Arrange
    mockOrdersState();
    render(<OrdersScreen />);

    // Act
    const first = screen.getByText("João Silva");
    const second = screen.getByText("Ana");

    // Assert
    expect(first).toBeTruthy();
    expect(second).toBeTruthy();
  });

  it("filtra pela aba Pendente", () => {
    // Arrange
    mockOrdersState();
    render(<OrdersScreen />);

    // Act
    // Índice 0 = aba "Pendente" (ordem do documento antes do badge do card).
    fireEvent.press(screen.getAllByText("Pendente")[0]);

    // Assert
    expect(screen.getByText("João Silva")).toBeTruthy();
    expect(screen.queryByText("Ana")).toBeNull();
  });

  it("filtra pela aba Concluído", () => {
    // Arrange
    mockOrdersState();
    render(<OrdersScreen />);

    // Act
    // Índice 0 = aba "Concluído" (ordem do documento antes do badge do card).
    fireEvent.press(screen.getAllByText("Concluído")[0]);

    // Assert
    expect(screen.getByText("Ana")).toBeTruthy();
    expect(screen.queryByText("João Silva")).toBeNull();
  });

  it("mostra o estado vazio ao filtrar um status sem pedidos", () => {
    // Arrange
    mockOrdersState({ data: [apiOrder] });
    render(<OrdersScreen />);

    // Act
    fireEvent.press(screen.getByText("Concluído"));

    // Assert
    expect(screen.getByText("Nenhum pedido nesta categoria")).toBeTruthy();
  });

  it("navega para o detalhe ao tocar em um pedido", () => {
    // Arrange
    mockOrdersState();
    render(<OrdersScreen />);

    // Act
    fireEvent.press(screen.getByText("João Silva"));

    // Assert
    expect(mockedPush).toHaveBeenCalledWith({
      pathname: "/shopkeeper/(private)/orders/order-detail",
      params: { id: "ord-1" },
    });
  });

  it("refaz a busca ao tocar em Atualizado agora", () => {
    // Arrange
    const { refetch } = mockOrdersState();
    render(<OrdersScreen />);

    // Act
    fireEvent.press(screen.getByText("Atualizado agora"));

    // Assert
    expect(refetch).toHaveBeenCalled();
  });
});