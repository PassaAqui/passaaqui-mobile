import { render, screen } from "@testing-library/react-native";
import { SummaryCard } from "@/src/features/shopkeeper/orders/components/SummaryCard";

jest.mock("@expo/vector-icons", () => {
  const { Text } = require("react-native");
  return {
    Ionicons: (props: { name: string }) => <Text>{`ionicon-${props.name}`}</Text>,
  };
});

describe("SummaryCard", () => {
  it("renderiza count e label", () => {
    // Arrange
    render(<SummaryCard icon="receipt-outline" count={3} label="Todos os pedidos" />);

    // Act
    const count = screen.getByText("3");
    const label = screen.getByText("Todos os pedidos");

    // Assert
    expect(count).toBeTruthy();
    expect(label).toBeTruthy();
  });

  it("renderiza o ícone informado", () => {
    // Arrange
    render(<SummaryCard icon="receipt-outline" count={3} label="Todos os pedidos" />);

    // Act
    const icon = screen.getByText("ionicon-receipt-outline");

    // Assert
    expect(icon).toBeTruthy();
  });

  it("renderiza o count zero", () => {
    // Arrange
    render(<SummaryCard icon="receipt-outline" count={0} label="Todos os pedidos" />);

    // Act
    const count = screen.getByText("0");

    // Assert
    expect(count).toBeTruthy();
  });
});