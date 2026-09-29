import { render, screen } from "@testing-library/react-native";
import WithoutSticker from "@/src/features/user/achievements/components/WithoutSticker";

describe("WithoutSticker", () => {
  it("renderiza o título e a descrição recebidos por prop", () => {
    // Arrange
    render(<WithoutSticker title="Tapioca real" description="Colete para colar" />);

    // Act / Assert
    expect(screen.getByText("Tapioca real")).toBeTruthy();
    expect(screen.getByText("Colete para colar")).toBeTruthy();
  });
});
