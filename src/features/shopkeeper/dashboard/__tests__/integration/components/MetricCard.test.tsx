import { render, screen } from "@testing-library/react-native";
import { MetricCard } from "@/src/features/shopkeeper/dashboard/components/MetricCard";

jest.mock("@expo/vector-icons", () => {
  const { Text } = require("react-native");
  return {
    Ionicons: (props: { name: string }) => <Text>{`ionicon-${props.name}`}</Text>,
  };
});

describe("MetricCard", () => {
  it("renderiza label e value", () => {
    // Arrange
    render(<MetricCard label="Pedidos hoje" value="12" icon="bag-handle-outline" />);

    // Act
    const label = screen.getByText("Pedidos hoje");
    const value = screen.getByText("12");

    // Assert
    expect(label).toBeTruthy();
    expect(value).toBeTruthy();
  });

  it("renderiza o ícone informado", () => {
    // Arrange
    render(<MetricCard label="Receita hoje" value="R$ 1.500" icon="cash-outline" />);

    // Act
    const icon = screen.getByText("ionicon-cash-outline");

    // Assert
    expect(icon).toBeTruthy();
  });

  it("não renderiza badge quando badge não é informado", () => {
    // Arrange
    render(<MetricCard label="Pedidos hoje" value="12" icon="bag-handle-outline" />);

    // Act
    const badge = screen.queryByText("10%");

    // Assert
    expect(badge).toBeNull();
  });

  it("renderiza badge e ícone de seta quando badge é informado", () => {
    // Arrange
    render(<MetricCard label="Pedidos hoje" value="12" icon="bag-handle-outline" badge="10%" />);

    // Act
    const badge = screen.getByText("10%");
    const arrow = screen.getByText("ionicon-arrow-up");

    // Assert
    expect(badge).toBeTruthy();
    expect(arrow).toBeTruthy();
  });
});