import { render, screen } from "@testing-library/react-native";
import { Image } from "react-native";
import CompleteRequiredXp from "@/src/features/user/shop/components/CompleteRequiredXp";

describe("CompleteRequiredXp", () => {
  it("mostra 'XP suficiente' e o ícone de check quando currentXp >= requiredXp", () => {
    // Arrange
    render(<CompleteRequiredXp currentXp={120} requiredXp={100} showText />);

    // Assert
    expect(screen.getByText("XP suficiente para resgatar!")).toBeTruthy();
    expect(screen.UNSAFE_getByType(Image)).toBeTruthy();
  });

  it("mostra apenas o ícone de check quando showText é false", () => {
    // Arrange
    render(<CompleteRequiredXp currentXp={120} requiredXp={100} showText={false} />);

    // Assert
    expect(screen.queryByText("XP suficiente para resgatar!")).toBeNull();
    expect(screen.UNSAFE_getByType(Image)).toBeTruthy();
  });

  it("mostra 'XP insuficiente' e a quantidade faltante quando currentXp < requiredXp", () => {
    // Arrange
    render(<CompleteRequiredXp currentXp={70} requiredXp={100} showText />);

    // Assert
    expect(screen.getByText("XP insuficiente")).toBeTruthy();
    expect(screen.getByText("Faltam 30 XP")).toBeTruthy();
  });
});
