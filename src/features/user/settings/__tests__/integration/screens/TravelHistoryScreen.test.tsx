import { fireEvent, render, screen } from "@testing-library/react-native";
import TravelHistoryScreen from "@/src/features/user/settings/screens/TravelHistoryScreen";
import { useTravelHistory } from "@/src/features/user/settings/hooks/useTravelHistory";
import {
  travelHistory,
  emptyTravelHistory,
} from "@/src/features/user/settings/__tests__/fixtures/travelHistory";

jest.mock("expo-router", () => ({
  router: {
    back: jest.fn(),
  },
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

jest.mock("@/src/features/user/settings/hooks/useTravelHistory", () => ({
  useTravelHistory: jest.fn(),
}));

const mockedUseTravelHistory = useTravelHistory as jest.MockedFunction<
  typeof useTravelHistory
>;

function mockTravelHistoryState(
  overrides: Partial<ReturnType<typeof useTravelHistory>> = {}
) {
  mockedUseTravelHistory.mockReturnValue({
    data: travelHistory,
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
    ...overrides,
  } as unknown as ReturnType<typeof useTravelHistory>);
}

describe("TravelHistoryScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTravelHistoryState();
  });

  it("mostra o indicador de loading enquanto busca o histórico", () => {
    // Arrange
    mockTravelHistoryState({ data: undefined, isLoading: true });

    // Act
    render(<TravelHistoryScreen />);

    // Assert
    expect(screen.getByTestId("travel-history-loading")).toBeTruthy();
    expect(screen.queryByText("Cristo Redentor")).toBeNull();
  });

  it("mostra a mensagem de erro quando a busca falha", () => {
    // Arrange
    mockTravelHistoryState({ data: undefined, isError: true });

    // Act
    render(<TravelHistoryScreen />);

    // Assert
    expect(screen.getByText("Não foi possível carregar o histórico")).toBeTruthy();
    expect(screen.queryByText("Cristo Redentor")).toBeNull();
  });

  it("refaz a busca ao tocar em tentar novamente", () => {
    // Arrange
    const refetch = jest.fn();
    mockTravelHistoryState({ data: undefined, isError: true, refetch });
    render(<TravelHistoryScreen />);

    // Act
    fireEvent.press(screen.getByText("Tentar novamente"));

    // Assert
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("mostra o estado vazio quando o turista não visitou nenhum local", () => {
    // Arrange
    mockTravelHistoryState({ data: emptyTravelHistory });

    // Act
    render(<TravelHistoryScreen />);

    // Assert
    expect(screen.getByText("Você ainda não visitou nenhum local.")).toBeTruthy();
  });

  it("agrupa as visitas por mês com o rótulo do mês", () => {
    // Act
    render(<TravelHistoryScreen />);

    // Assert
    expect(screen.getByText("Setembro de 2026")).toBeTruthy();
    expect(screen.getByText("Maio de 2026")).toBeTruthy();
  });

  it("mostra os dados do POI com data e distância formatadas", () => {
    // Act
    render(<TravelHistoryScreen />);

    // Assert
    expect(screen.getByText("Cristo Redentor")).toBeTruthy();
    expect(screen.getByText("Rio de Janeiro")).toBeTruthy();
    expect(screen.getByText("24/05/2026 às 14:30 · 1,25 km")).toBeTruthy();
    expect(screen.getByText("+50 XP")).toBeTruthy();
  });

  it("mostra todos os POIs recebidos", () => {
    // Act
    render(<TravelHistoryScreen />);

    // Assert
    expect(screen.getByText("Marco Zero")).toBeTruthy();
    expect(screen.getByText("Recife")).toBeTruthy();
    expect(screen.getByText("18/09/2026 às 16:10 · 0,80 km")).toBeTruthy();
    expect(screen.getByText("+40 XP")).toBeTruthy();
  });
});