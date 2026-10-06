import { fireEvent, render, screen } from "@testing-library/react-native";
import { Modal } from "react-native";
import SwitchDestinationModal from "@/src/features/user/map/components/SwitchDestinationModal";

describe("SwitchDestinationModal", () => {
  const onConfirm = jest.fn();
  const onCancel = jest.fn();
  const onClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("não renderiza o conteúdo quando visible é false", () => {
    // Arrange
    render(
      <SwitchDestinationModal
        visible={false}
        onConfirm={onConfirm}
        onCancel={onCancel}
        onClose={onClose}
      />
    );

    // Act
    const message = screen.queryByText(/destino traçado/);

    // Assert
    expect(message).toBeNull();
  });

  it("renderiza o aviso quando visible é true", () => {
    // Arrange
    render(
      <SwitchDestinationModal
        visible
        onConfirm={onConfirm}
        onCancel={onCancel}
        onClose={onClose}
      />
    );

    // Act
    const title = screen.getByText("ATENÇÂO!");
    const message = screen.getByText(/destino traçado/);

    // Assert
    expect(title).toBeTruthy();
    expect(message).toBeTruthy();
  });

  it("chama onConfirm ao pressionar Confirmar", () => {
    // Arrange
    render(
      <SwitchDestinationModal
        visible
        onConfirm={onConfirm}
        onCancel={onCancel}
        onClose={onClose}
      />
    );

    // Act
    fireEvent.press(screen.getByText("Confirmar"));

    // Assert
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
  });

  it("chama onCancel ao pressionar Cancelar", () => {
    // Arrange
    render(
      <SwitchDestinationModal
        visible
        onConfirm={onConfirm}
        onCancel={onCancel}
        onClose={onClose}
      />
    );

    // Act
    fireEvent.press(screen.getByText("Cancelar"));

    // Assert
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("chama onClose no onRequestClose", () => {
    // Arrange
    render(
      <SwitchDestinationModal
        visible
        onConfirm={onConfirm}
        onCancel={onCancel}
        onClose={onClose}
      />
    );

    // Act
    fireEvent(screen.UNSAFE_getByType(Modal), "requestClose");

    // Assert
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
