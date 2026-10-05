import { fireEvent, render, screen } from "@testing-library/react-native";
import AchievementScreen from "@/src/features/user/achievements/screens/AchievementScreen";
import CompleteSticker from "@/src/features/user/achievements/components/CompleteSticker";
import WithoutSticker from "@/src/features/user/achievements/components/WithoutSticker";
import { useAchievements } from "@/src/features/user/achievements/hooks/useAchievements";
import { useAchievementCategories } from "@/src/features/user/achievements/hooks/useAchievementCategories";
import { useTouristMe } from "@/src/features/user/auth/hooks/useTouristMe";
import {
  achievementCategories,
  achievements,
  emptyAchievementCategories,
  emptyAchievements,
} from "@/src/features/user/achievements/__tests__/fixtures/achievement";

jest.mock("expo-navigation-bar", () => ({
  setButtonStyleAsync: jest.fn(),
}));

jest.mock("@expo/vector-icons", () => {
  const { Text } = require("react-native");
  return {
    Ionicons: (props: { name: string }) => <Text>{`ionicon-${props.name}`}</Text>,
  };
});

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

jest.mock("@/src/features/user/achievements/hooks/useAchievements", () => ({
  useAchievements: jest.fn(),
}));

jest.mock("@/src/features/user/achievements/hooks/useAchievementCategories", () => ({
  useAchievementCategories: jest.fn(),
}));

jest.mock("@/src/features/user/auth/hooks/useTouristMe", () => ({
  useTouristMe: jest.fn(),
}));

const mockedUseAchievements = useAchievements as jest.MockedFunction<
  typeof useAchievements
>;
const mockedUseAchievementCategories =
  useAchievementCategories as jest.MockedFunction<typeof useAchievementCategories>;
const mockedUseTouristMe = useTouristMe as jest.MockedFunction<typeof useTouristMe>;

function mockAchievementsQuery(
  overrides: Partial<ReturnType<typeof useAchievements>> = {}
) {
  mockedUseAchievements.mockReturnValue({
    data: achievements,
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
    ...overrides,
  } as unknown as ReturnType<typeof useAchievements>);
}

function mockCategoriesQuery(
  overrides: Partial<ReturnType<typeof useAchievementCategories>> = {}
) {
  mockedUseAchievementCategories.mockReturnValue({
    data: achievementCategories,
    isLoading: false,
    isError: false,
    ...overrides,
  } as unknown as ReturnType<typeof useAchievementCategories>);
}

describe("AchievementScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAchievementsQuery();
    mockCategoriesQuery();
    mockedUseTouristMe.mockReturnValue({
      data: { id: 1, name: "Turista Teste", email: "t@t.com", currentXP: 2450 },
    } as unknown as ReturnType<typeof useTouristMe>);
  });

  it("mostra o XP do turista logado em vez do valor mockado", () => {
    // Act
    render(<AchievementScreen />);

    // Assert
    expect(screen.getByText("2450 XP")).toBeTruthy();
  });

  it("mostra 0 XP quando o perfil do turista ainda não carregou", () => {
    // Arrange
    mockedUseTouristMe.mockReturnValue({ data: undefined } as unknown as ReturnType<
      typeof useTouristMe
    >);

    // Act
    render(<AchievementScreen />);

    // Assert
    expect(screen.getByText("0 XP")).toBeTruthy();
  });

  it("renderiza CompleteSticker para a conquista desbloqueada", () => {
    // Act
    render(<AchievementScreen />);

    // Assert
    expect(screen.UNSAFE_getAllByType(CompleteSticker)).toHaveLength(1);
  });

  it("renderiza WithoutSticker para a conquista bloqueada", () => {
    // Act
    render(<AchievementScreen />);

    // Assert
    expect(screen.UNSAFE_getAllByType(WithoutSticker)).toHaveLength(1);
  });

  it("mostra o indicador de carregamento enquanto busca as conquistas", () => {
    // Arrange
    mockAchievementsQuery({ data: undefined, isLoading: true });

    // Act
    render(<AchievementScreen />);

    // Assert
    expect(screen.UNSAFE_queryAllByType(CompleteSticker)).toHaveLength(0);
    expect(screen.getByTestId("achievements-loading")).toBeTruthy();
  });

  it("mostra a mensagem de erro com opção de tentar novamente", () => {
    // Arrange
    const refetch = jest.fn();
    mockAchievementsQuery({ data: undefined, isError: true, refetch });

    // Act
    render(<AchievementScreen />);

    // Assert
    expect(screen.getByText("Não foi possível carregar as conquistas")).toBeTruthy();
    expect(screen.getByText("Tentar novamente")).toBeTruthy();
    expect(refetch).not.toHaveBeenCalled();
  });

  it("chama o refetch ao pressionar 'Tentar novamente'", () => {
    // Arrange
    const refetch = jest.fn();
    mockAchievementsQuery({ data: undefined, isError: true, refetch });
    const { getByText } = render(<AchievementScreen />);

    // Act
    fireEvent.press(getByText("Tentar novamente"));

    // Assert
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("mostra o estado vazio quando não há conquistas", () => {
    // Arrange
    mockAchievementsQuery({ data: emptyAchievements });

    // Act
    render(<AchievementScreen />);

    // Assert
    expect(screen.getByText("Nenhuma conquista disponível")).toBeTruthy();
  });

  it("renderiza um chip por categoria retornada pela API", () => {
    // Act
    render(<AchievementScreen />);

    // Assert
    expect(screen.getByText("Tudo")).toBeTruthy();
    expect(screen.getByText("Sabores da Mata")).toBeTruthy();
    expect(screen.getByText("Raízes do Brasil")).toBeTruthy();
    // Só as categorias da API viram chip: nenhum filtro antigo permanece.
    expect(achievementCategories).toHaveLength(3);
    expect(screen.queryAllByTestId(/^category-chip-/)).toHaveLength(3);
  });

  it("começa na categoria TUDO e busca as conquistas sem filtro", () => {
    // Act
    render(<AchievementScreen />);

    // Assert
    expect(mockedUseAchievements).toHaveBeenCalledWith(undefined);
    expect(
      screen.getByTestId("category-chip-TUDO").props.className
    ).toContain("bg-[#D8D2C5]");
  });

  it("busca as conquistas da categoria ao tocar no chip", () => {
    // Arrange
    render(<AchievementScreen />);
    mockedUseAchievements.mockClear();

    // Act
    fireEvent.press(screen.getByTestId("category-chip-SABORES_DA_MATA"));

    // Assert
    expect(mockedUseAchievements).toHaveBeenCalledWith("SABORES_DA_MATA");
    expect(
      screen.getByTestId("category-chip-SABORES_DA_MATA").props.className
    ).toContain("bg-[#D8D2C5]");
    expect(
      screen.getByTestId("category-chip-TUDO").props.className
    ).toContain("bg-[#E5DFD3]");
  });

  it("volta para a listagem completa ao tocar na categoria TUDO", () => {
    // Arrange
    render(<AchievementScreen />);
    fireEvent.press(screen.getByTestId("category-chip-RAIZES_DO_BRASIL"));
    mockedUseAchievements.mockClear();

    // Act
    fireEvent.press(screen.getByTestId("category-chip-TUDO"));

    // Assert
    expect(mockedUseAchievements).toHaveBeenCalledWith(undefined);
  });

  it("mantém a listagem de conquistas visível enquanto as categorias carregam", () => {
    // Arrange
    mockCategoriesQuery({ data: undefined, isLoading: true });

    // Act
    render(<AchievementScreen />);

    // Assert
    expect(screen.queryByTestId("category-chip-TUDO")).toBeNull();
    expect(screen.UNSAFE_getAllByType(CompleteSticker)).toHaveLength(1);
  });

  it("não mostra chips quando a API não retorna categorias", () => {
    // Arrange
    mockCategoriesQuery({ data: emptyAchievementCategories });

    // Act
    render(<AchievementScreen />);

    // Assert
    expect(screen.queryByTestId("category-chip-TUDO")).toBeNull();
    expect(screen.UNSAFE_getAllByType(CompleteSticker)).toHaveLength(1);
  });
});
