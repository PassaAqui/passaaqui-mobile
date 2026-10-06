import { fireEvent, render, screen } from "@testing-library/react-native";
import StopButton from "@/src/features/user/map/components/StopButton";

describe("StopButton", () => {
  it("renderiza o botão PARAR", () => {
    // Arrange
    render(<StopButton onConfirmate={jest.fn()} />);

    // Act
    const button = screen.getByText("PARAR");

    // Assert
    expect(button).toBeTruthy();
  });

  it("chama onConfirmate ao pressionar", () => {
    // Arrange
    const onConfirmate = jest.fn();
    render(<StopButton onConfirmate={onConfirmate} />);

    // Act
    fireEvent.press(screen.getByText("PARAR"));

    // Assert
    expect(onConfirmate).toHaveBeenCalledTimes(1);
  });
});
