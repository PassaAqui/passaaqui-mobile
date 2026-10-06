import { fireEvent, render, screen } from "@testing-library/react-native";
import { Modal } from "react-native";
import OutsideRegionModal from "@/src/features/user/map/components/OutsideRegionModal";

describe("OutsideRegionModal", () => {
  const onClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("não renderiza o conteúdo quando visible é false", () => {
    // Arrange
    render(<OutsideRegionModal visible={false} onClose={onClose} />);

    // Act
    const title = screen.queryByText("ATENÇÂO!");

    // Assert
    expect(title).toBeNull();
  });

  it("renderiza o alerta quando visible é true", () => {
    // Arrange
    render(<OutsideRegionModal visible onClose={onClose} />);

    // Act
    const title = screen.getByText("ATENÇÂO!");
    const message = screen.getByText(/Parece que você está longe de Recife/);

    // Assert
    expect(title).toBeTruthy();
    expect(message).toBeTruthy();
  });

  it("chama onClose ao pressionar Entendido", () => {
    // Arrange
    render(<OutsideRegionModal visible onClose={onClose} />);

    // Act
    fireEvent.press(screen.getByText("Entendido"));

    // Assert
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("chama onClose no onRequestClose", () => {
    // Arrange
    render(<OutsideRegionModal visible onClose={onClose} />);

    // Act
    fireEvent(screen.UNSAFE_getByType(Modal), "requestClose");

    // Assert
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
