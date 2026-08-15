import { fireEvent, render, screen } from "@testing-library/react-native";
import { OrderCard } from "@/src/features/shopkeeper/orders/components/OrderCard";
import {
  displayCompletedOrder,
  displayOrder,
} from "@/src/features/shopkeeper/orders/__tests__/fixtures/orders";

jest.mock("@expo/vector-icons", () => {
  const { Text } = require("react-native");
  return {
    Ionicons: (props: { name: string }) => <Text>{`ionicon-${props.name}`}</Text>,
  };
});

describe("OrderCard", () => {
  it("renderiza os dados do pedido", () => {
    // Arrange
    render(<OrderCard order={displayOrder} onPress={jest.fn()} />);

    // Act
    const initials = screen.getByText("JS");
    const name = screen.getByText("João Silva");
    const time = screen.getByText("Há 5 min");
    const items = screen.getByText("2x Café, 1x Torta");
    const code = screen.getByText("#AB1020");
    const card = screen.getByTestId("order-card");

    // Assert
    expect(initials).toBeTruthy();
    expect(name).toBeTruthy();
    expect(time).toBeTruthy();
    expect(items).toBeTruthy();
    expect(code).toBeTruthy();
    expect(card).toBeTruthy();
  });

  it("exibe o badge de status Pendente", () => {
    // Arrange
    render(<OrderCard order={displayOrder} onPress={jest.fn()} />);

    // Act
    const badge = screen.getByText("Pendente");

    // Assert
    expect(badge).toBeTruthy();
  });

  it("exibe o badge de status Concluído", () => {
    // Arrange
    render(<OrderCard order={displayCompletedOrder} onPress={jest.fn()} />);

    // Act
    const badge = screen.getByText("Concluído");

    // Assert
    expect(badge).toBeTruthy();
  });

  it("chama onPress ao tocar no card", () => {
    // Arrange
    const onPress = jest.fn();
    render(<OrderCard order={displayOrder} onPress={onPress} />);

    // Act
    fireEvent.press(screen.getByText("João Silva"));

    // Assert
    expect(onPress).toHaveBeenCalled();
  });
});