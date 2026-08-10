import { render, screen } from "@testing-library/react-native";
import { View } from "react-native";
import XpBar from "@/src/features/user/shop/components/XpBar";

describe("XpBar", () => {
  it("renderiza o progresso com a largura correta", () => {
    // Arrange
    render(<XpBar currentXp={50} xpRequired={100} thickness={4} />);

    // Act
    const views = screen.UNSAFE_getAllByType(View);

    // Assert
    expect(views[1].props.style).toEqual({ width: "50%" });
  });

  it("limita o progresso em 100% quando currentXp excede xpRequired", () => {
    // Arrange
    render(<XpBar currentXp={150} xpRequired={100} thickness={4} />);

    // Act
    const views = screen.UNSAFE_getAllByType(View);

    // Assert
    expect(views[1].props.style).toEqual({ width: "100%" });
  });

  it("renderiza progresso zerado quando currentXp é 0", () => {
    // Arrange
    render(<XpBar currentXp={0} xpRequired={100} thickness={4} />);

    // Act
    const views = screen.UNSAFE_getAllByType(View);

    // Assert
    expect(views[1].props.style).toEqual({ width: "0%" });
  });

  it("calcula a altura do track como thickness * 3", () => {
    // Arrange
    render(<XpBar currentXp={50} xpRequired={100} thickness={3} />);

    // Act
    const views = screen.UNSAFE_getAllByType(View);

    // Assert
    expect(views[0].props.style).toMatchObject({ height: 9 });
  });
});
