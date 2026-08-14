import { ActivityIndicator } from "react-native";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import CatalogScreen from "@/src/features/shopkeeper/catalog/screens/CatalogScreen";
import { useShopkeeperProducts } from "@/src/features/shopkeeper/catalog/hooks/useShopkeeperProducts";
import { useShopkeeperProductMetrics } from "@/src/features/shopkeeper/catalog/hooks/useShopkeeperProductMetrics";
import {
  inactiveProduct,
  metrics,
  shopkeeperProducts,
} from "@/src/features/shopkeeper/catalog/__tests__/fixtures/catalog";

jest.mock(
  "@/src/features/shopkeeper/catalog/hooks/useShopkeeperProducts",
  () => ({
    useShopkeeperProducts: jest.fn(),
  })
);

jest.mock(
  "@/src/features/shopkeeper/catalog/hooks/useShopkeeperProductMetrics",
  () => ({
    useShopkeeperProductMetrics: jest.fn(),
  })
);

jest.mock("@/src/features/shopkeeper/catalog/components/ProductCard", () => {
  const { Text } = require("react-native");
  return {
    ProductCard: ({ product }: { product: { name: string } }) => (
      <Text>{product.name}</Text>
    ),
  };
});

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

const mockedUseShopkeeperProducts = useShopkeeperProducts as jest.MockedFunction<
  typeof useShopkeeperProducts
>;
const mockedUseShopkeeperProductMetrics =
  useShopkeeperProductMetrics as jest.MockedFunction<
    typeof useShopkeeperProductMetrics
  >;
const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockedPush = jest.fn();

function mockProductsState(
  overrides: Partial<ReturnType<typeof useShopkeeperProducts>> = {}
) {
  mockedUseShopkeeperProducts.mockReturnValue({
    data: shopkeeperProducts,
    isLoading: false,
    isError: false,
    ...overrides,
  } as unknown as ReturnType<typeof useShopkeeperProducts>);
}

describe("CatalogScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockProductsState();
    mockedUseShopkeeperProductMetrics.mockReturnValue({
      data: metrics,
    } as unknown as ReturnType<typeof useShopkeeperProductMetrics>);
    mockedUseRouter.mockReturnValue({ push: mockedPush } as unknown as ReturnType<
      typeof useRouter
    >);
  });

  it("renderiza o header Meu Catálogo", () => {
    // Arrange

    // Act
    render(<CatalogScreen />);

    // Assert
    expect(screen.getByText("Meu Catálogo")).toBeTruthy();
  });

  it("renderiza os três cards de métricas com os valores", () => {
    // Arrange

    // Act
    render(<CatalogScreen />);

    // Assert
    expect(screen.getByText("Produtos")).toBeTruthy();
    expect(screen.getByText("12")).toBeTruthy();
    expect(screen.getByText("Ativos")).toBeTruthy();
    expect(screen.getByText("10")).toBeTruthy();
    expect(screen.getByText("Destaque")).toBeTruthy();
    expect(screen.getByText("3")).toBeTruthy();
  });

  it("mostra o indicador de loading enquanto carrega os produtos", () => {
    // Arrange
    mockProductsState({ data: undefined, isLoading: true });

    // Act
    render(<CatalogScreen />);

    // Assert
    expect(screen.UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
    expect(screen.queryByText("Café especial")).toBeNull();
  });

  it("mostra a mensagem de erro quando falha ao carregar", () => {
    // Arrange
    mockProductsState({ data: undefined, isError: true });

    // Act
    render(<CatalogScreen />);

    // Assert
    expect(
      screen.getByText("Não foi possível carregar os produtos")
    ).toBeTruthy();
  });

  it("mostra o estado vazio quando não há produtos", () => {
    // Arrange
    mockProductsState({ data: [] });

    // Act
    render(<CatalogScreen />);

    // Assert
    expect(screen.getByText("Nenhum produto encontrado")).toBeTruthy();
  });

  it("lista apenas os produtos ativos no filtro DISPONÍVEL (default)", () => {
    // Arrange

    // Act
    render(<CatalogScreen />);

    // Assert
    expect(screen.getByText("Café especial")).toBeTruthy();
    expect(screen.getByText("Boneco de barro")).toBeTruthy();
    expect(screen.queryByText("Café desativado")).toBeNull();
  });

  it("filtra a busca por nome de forma case-insensitive", () => {
    // Arrange
    render(<CatalogScreen />);

    // Act
    fireEvent.changeText(
      screen.getByLabelText("Campo de busca de produtos"),
      "café"
    );

    // Assert
    expect(screen.getByText("Café especial")).toBeTruthy();
    expect(screen.queryByText("Boneco de barro")).toBeNull();
    expect(screen.queryByText("Café desativado")).toBeNull();
  });

  it("mostra o estado vazio quando a busca não encontra nada", () => {
    // Arrange
    render(<CatalogScreen />);

    // Act
    fireEvent.changeText(
      screen.getByLabelText("Campo de busca de produtos"),
      "inexistente"
    );

    // Assert
    expect(screen.getByText("Nenhum produto encontrado")).toBeTruthy();
  });

  it("limpa a busca ao tocar no ícone de fechar", () => {
    // Arrange
    render(<CatalogScreen />);
    fireEvent.changeText(
      screen.getByLabelText("Campo de busca de produtos"),
      "café"
    );
    expect(screen.queryByText("Boneco de barro")).toBeNull();

    // Act
    fireEvent.press(screen.getByText("ionicon-close-circle"));

    // Assert
    expect(screen.getByText("Boneco de barro")).toBeTruthy();
    expect(screen.getByText("Café especial")).toBeTruthy();
  });

  it("filtra pela categoria GASTRONOMIA ao tocar no chip", () => {
    // Arrange
    render(<CatalogScreen />);

    // Act
    fireEvent.press(screen.getByRole("button", { name: "GASTRONOMIA" }));

    // Assert
    expect(
      screen.getByRole("button", { name: "GASTRONOMIA", selected: true })
    ).toBeTruthy();
    expect(screen.getByText("Café especial")).toBeTruthy();
    expect(screen.getByText("Café desativado")).toBeTruthy();
    expect(screen.queryByText("Boneco de barro")).toBeNull();
  });

  it("mostra todos os produtos no filtro ARTESANATO", () => {
    // Arrange
    render(<CatalogScreen />);

    // Act
    fireEvent.press(screen.getByRole("button", { name: "ARTESANATO" }));

    // Assert
    expect(screen.getByText("Café especial")).toBeTruthy();
    expect(screen.getByText("Boneco de barro")).toBeTruthy();
    expect(screen.getByText(inactiveProduct.name)).toBeTruthy();
  });

  it("navega para a criação de produto ao tocar no botão flutuante", () => {
    // Arrange
    render(<CatalogScreen />);

    // Act
    fireEvent.press(screen.getByLabelText("Adicionar novo produto"));

    // Assert
    expect(mockedPush).toHaveBeenCalledWith({
      pathname: "/shopkeeper/(private)/products/create-product",
    });
  });
});