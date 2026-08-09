import { fireEvent, render, screen } from "@testing-library/react-native";
import FollowUserButton from "@/src/features/user/map/components/FollowUserButton";

describe("FollowUserButton", () => {
  it("renderiza o botão SEGUIR", () => {
    // Arrange
    render(<FollowUserButton onFollow={jest.fn()} />);

    // Act
    const button = screen.getByText("SEGUIR");

    // Assert
    expect(button).toBeTruthy();
  });

  it("chama onFollow ao pressionar", () => {
    // Arrange
    const onFollow = jest.fn();
    render(<FollowUserButton onFollow={onFollow} />);

    // Act
    fireEvent.press(screen.getByText("SEGUIR"));

    // Assert
    expect(onFollow).toHaveBeenCalledTimes(1);
  });
});
