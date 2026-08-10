import { render, screen } from "@testing-library/react-native";
import { View } from "react-native";
import StarRating from "@/src/features/user/shop/components/StarRating";

describe("StarRating", () => {
  it("renderiza as estrelas de fundo e o overlay amarelo com a largura do percentual", () => {
    // Arrange
    render(<StarRating rating={3} max={5} />);

    // Act
    const stars = screen.getAllByText("★");
    const views = screen.UNSAFE_getAllByType(View);

    // Assert
    expect(stars).toHaveLength(10);
    expect(views[2].props.style).toMatchObject({ width: "60%" });
  });

  it("usa max igual a 5 por padrão", () => {
    // Arrange
    render(<StarRating rating={1} />);

    // Act
    const stars = screen.getAllByText("★");

    // Assert
    expect(stars).toHaveLength(10);
  });
});
