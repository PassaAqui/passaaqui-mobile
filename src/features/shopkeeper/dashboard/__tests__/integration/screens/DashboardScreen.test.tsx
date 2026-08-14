import { ActivityIndicator, RefreshControl } from "react-native";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import DashboardScreen from "@/src/features/shopkeeper/dashboard/screens/DashboardScreen";
import { useDashboard } from "@/src/features/shopkeeper/dashboard/hooks/useDashboard";
import { useShopkeeperMe } from "@/src/features/shopkeeper/auth/hooks/useShopkeeperMe";
import {
  dashboard,
  recentOrders,
  weeklySales,
} from "@/src/features/shopkeeper/dashboard/__tests__/fixtures/dashboard";
import { shopkeeperMe } from "@/src/features/shopkeeper/auth/__tests__/fixtures/shopkeeper";

jest.mock("@/src/features/shopkeeper/dashboard/hooks/useDashboard", () => ({
  useDashboard: jest.fn(),
}));

jest.mock("@/src/features/shopkeeper/auth/hooks/useShopkeeperMe", () => ({
  useShopkeeperMe: jest.fn(),
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

const mockedUseDashboard = useDashboard as jest.MockedFunction<typeof useDashboard>;
const mockedUseShopkeeperMe =
  useShopkeeperMe as jest.MockedFunction<typeof useShopkeeperMe>;
const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockedPush = jest.fn();

function mockSuccessState(overrides: Partial<ReturnType<typeof useDashboard>> = {}) {
  const refetch = jest.fn();
  mockedUseDashboard.mockReturnValue({
    data: { ...dashboard, recentOrders, weeklySales },
    isLoading: false,
    isError: false,
    error: null,
    refetch,
    isRefetching: false,
    ...overrides,
  } as unknown as ReturnType<typeof useDashboard>);
  return { refetch };
}

describe("DashboardScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseShopkeeperMe.mockReturnValue({
      data: shopkeeperMe,
    } as unknown as ReturnType<typeof useShopkeeperMe>);
    mockedUseRouter.mockReturnValue({ push: mockedPush } as unknown as ReturnType<
      typeof useRouter
    >);
  });

  it("mostra o indicador de loading enquanto carrega", () => {
    // Arrange
    mockedUseDashboard.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: jest.fn(),
      isRefetching: false,
    } as unknown as ReturnType<typeof useDashboard>);

    // Act
    render(<DashboardScreen />);

    // Assert
    expect(screen.UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
    expect(screen.queryByText("PassaAqui")).toBeNull();
  });

  it("mostra mensagem de erro e refaz a busca ao tocar em Tentar novamente", () => {
    // Arrange
    const { refetch } = mockSuccessState({
      data: undefined,
      isError: true,
      error: new Error("falha"),
    });
    render(<DashboardScreen />);

    // Act
    fireEvent.press(screen.getByText("Tentar novamente"));

    // Assert
    expect(screen.getByText("Não foi possível carregar os dados do dashboard.")).toBeTruthy();
    expect(refetch).toHaveBeenCalled();
  });

  it("mostra mensagem de erro quando não há isError mas data está ausente", () => {
    // Arrange
    mockSuccessState({ data: undefined, isError: false, error: null });
    render(<DashboardScreen />);

    // Act
    const message = screen.getByText("Não foi possível carregar os dados do dashboard.");

    // Assert
    expect(message).toBeTruthy();
  });

  it("renderiza o header com os dados do lojista", () => {
    // Arrange
    mockSuccessState();
    render(<DashboardScreen />);

    // Act
    const appName = screen.getByText("PassaAqui");
    const greeting = screen.getByText(/Bom dia, Maria Silva/);
    const company = screen.getByText("Café do Recife");

    // Assert
    expect(appName).toBeTruthy();
    expect(greeting).toBeTruthy();
    expect(company).toBeTruthy();
  });

  it("renderiza os quatro metric cards com os valores do dashboard", () => {
    // Arrange
    mockSuccessState();
    render(<DashboardScreen />);

    // Act
    const pedidos = screen.getByText("Pedidos hoje");
    const pedidosValue = screen.getByText("12");
    const receita = screen.getByText("Receita hoje");
    const receitaValue = screen.getByText("R$ 1.500");
    const ativos = screen.getByText("Produtos ativos");
    const ativosValue = screen.getByText("34");
    const pendentes = screen.getByText("Pedidos pendentes");
    const pendentesValue = screen.getByText("3");

    // Assert
    expect(pedidos).toBeTruthy();
    expect(pedidosValue).toBeTruthy();
    expect(receita).toBeTruthy();
    expect(receitaValue).toBeTruthy();
    expect(ativos).toBeTruthy();
    expect(ativosValue).toBeTruthy();
    expect(pendentes).toBeTruthy();
    expect(pendentesValue).toBeTruthy();
  });

  it("renderiza o gráfico semanal", () => {
    // Arrange
    mockSuccessState();
    render(<DashboardScreen />);

    // Act
    const title = screen.getByText("Vendas da semana");
    const maxLabels = screen.getAllByText("120").length;

    // Assert
    expect(title).toBeTruthy();
    expect(maxLabels).toBeGreaterThanOrEqual(1);
  });

  it("renderiza a lista de pedidos recentes com código, cliente e itens", () => {
    // Arrange
    mockSuccessState();
    render(<DashboardScreen />);

    // Act
    const section = screen.getByText("Pedidos recentes");
    const firstOrder = screen.getByText("AB1020 · João");
    const firstItems = screen.getByText("Café, Torta");
    const secondOrder = screen.getByText("CD2031 · Ana");
    const secondItems = screen.getByText("Capuccino, Sanduíche");

    // Assert
    expect(section).toBeTruthy();
    expect(firstOrder).toBeTruthy();
    expect(firstItems).toBeTruthy();
    expect(secondOrder).toBeTruthy();
    expect(secondItems).toBeTruthy();
  });

  it("exibe o badge de status Pendente para PENDING e Confirmado para COMPLETED", () => {
    // Arrange
    mockSuccessState();
    render(<DashboardScreen />);

    // Act
    const pending = screen.getAllByText("Pendente");
    const confirmed = screen.getAllByText("Confirmado");

    // Assert
    expect(pending.length).toBeGreaterThan(0);
    expect(confirmed.length).toBeGreaterThan(0);
  });

  it("mostra o estado vazio quando não há pedidos recentes", () => {
    // Arrange
    mockSuccessState({ data: { ...dashboard, recentOrders: [] } });
    render(<DashboardScreen />);

    // Act
    const empty = screen.getByText("Nenhum pedido recente.");

    // Assert
    expect(empty).toBeTruthy();
  });

  it("navega para o detalhe do pedido ao tocar em um pedido", () => {
    // Arrange
    mockSuccessState();
    render(<DashboardScreen />);

    // Act
    fireEvent.press(screen.getByText("AB1020 · João"));

    // Assert
    expect(mockedPush).toHaveBeenCalledWith({
      pathname: "/shopkeeper/(private)/orders/order-detail",
      params: { id: "ord-1" },
    });
  });

  it("navega para a lista de pedidos ao tocar em Ver todos", () => {
    // Arrange
    mockSuccessState();
    render(<DashboardScreen />);

    // Act
    fireEvent.press(screen.getByText("Ver todos"));

    // Assert
    expect(mockedPush).toHaveBeenCalledWith("/shopkeeper/(tabs)/orders");
  });

  it("refaz a busca ao puxar para atualizar", () => {
    // Arrange
    const { refetch } = mockSuccessState({ isRefetching: true });
    render(<DashboardScreen />);

    // Act
    const refreshControl = screen.UNSAFE_getByType(RefreshControl);
    refreshControl.props.onRefresh();

    // Assert
    expect(refreshControl.props.refreshing).toBe(true);
    expect(refetch).toHaveBeenCalled();
  });
});