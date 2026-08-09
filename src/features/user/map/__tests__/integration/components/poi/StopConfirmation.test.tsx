import { fireEvent, render, screen } from "@testing-library/react-native";
import { Modal } from "react-native";
import StopConfirmation from "@/src/features/user/map/poi/components/StopConfirmation";

describe("StopConfirmation", () => {
  const onStop = jest.fn();
  const onClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("não renderiza o conteúdo quando visible é false", () => {
    // Arrange
    render(<StopConfirmation visible={false} onStop={onStop} onClose={onClose} />);

    // Act
    const message = screen.queryByText(/cancelar essa viagem/);

    // Assert
    expect(message).toBeNull();
  });

  it("renderiza o aviso de cancelamento quando visible é true", () => {
    // Arrange
    render(<StopConfirmation visible onStop={onStop} onClose={onClose} />);

    // Act
    const title = screen.getByText("ATENÇÃO!");
    const message = screen.getByText(/cancelar essa viagem/);

    // Assert
    expect(title).toBeTruthy();
    expect(message).toBeTruthy();
  });

  it("chama onStop ao pressionar Confirmar", () => {
    // Arrange
    render(<StopConfirmation visible onStop={onStop} onClose={onClose} />);

    // Act
    fireEvent.press(screen.getByText("Confirmar"));

    // Assert
    expect(onStop).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("chama onClose no onRequestClose", () => {
    // Arrange
    render(<StopConfirmation visible onStop={onStop} onClose={onClose} />);

    // Act
    fireEvent(screen.UNSAFE_getByType(Modal), "requestClose");

    // Assert
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
