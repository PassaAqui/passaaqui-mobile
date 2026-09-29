import { fireEvent, render, screen } from "@testing-library/react-native";
import CompleteSticker from "@/src/features/user/achievements/components/CompleteSticker";
import {
  unlockedAchievement,
} from "@/src/features/user/achievements/__tests__/fixtures/achievement";

describe("CompleteSticker", () => {
  it("renderiza o nome e a foto da conquista recebida", () => {
    // Arrange
    render(<CompleteSticker achievement={unlockedAchievement} invertRotate={false} />);

    // Act / Assert
    expect(screen.getByText("Rio Timbó")).toBeTruthy();
    expect(screen.getByTestId("sticker-image").props.source).toEqual({
      uri: "http://localhost:9000/test-bucket/achievements/rio-timbo.jpg",
    });
  });

  it("abre o modal de detalhe ao pressionar o card", () => {
    // Arrange
    render(<CompleteSticker achievement={unlockedAchievement} invertRotate={false} />);

    // Act
    fireEvent.press(screen.getByTestId("sticker-card"));

    // Assert
    expect(screen.getByText("← Voltar")).toBeTruthy();
    expect(screen.getByText("01/01/2026")).toBeTruthy();
  });

  it("inverte a rotação quando invertRotate é verdadeiro", () => {
    // Arrange
    render(<CompleteSticker achievement={unlockedAchievement} invertRotate />);

    // Act / Assert
    expect(screen.getByTestId("sticker-card").props.className).toContain("-rotate-2");
  });
});
