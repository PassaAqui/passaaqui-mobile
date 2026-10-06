import { fireEvent, render, screen } from "@testing-library/react-native";
import { Modal } from "react-native";
import CheckinRewardModal from "@/src/features/user/map/poi/components/CheckinRewardModal";

describe("CheckinRewardModal", () => {
  const onClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("não renderiza o conteúdo quando visible é false", () => {
    // Arrange
    render(<CheckinRewardModal visible={false} xpEarned={50} onClose={onClose} />);

    // Act
    const reward = screen.queryByText("+50 XP");

    // Assert
    expect(reward).toBeNull();
  });

  it("renderiza o XP ganho quando visible é true", () => {
    // Arrange
    render(<CheckinRewardModal visible xpEarned={50} onClose={onClose} />);

    // Act
    const title = screen.getByText("Novo lugar descoberto!");
    const reward = screen.getByText("+50 XP");

    // Assert
    expect(title).toBeTruthy();
    expect(reward).toBeTruthy();
  });

  it("chama onClose ao pressionar Fechar", () => {
    // Arrange
    render(<CheckinRewardModal visible xpEarned={50} onClose={onClose} />);

    // Act
    fireEvent.press(screen.getByText("Fechar"));

    // Assert
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("chama onClose no onRequestClose", () => {
    // Arrange
    render(<CheckinRewardModal visible xpEarned={50} onClose={onClose} />);

    // Act
    fireEvent(screen.UNSAFE_getByType(Modal), "requestClose");

    // Assert
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
