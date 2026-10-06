import { render, screen } from "@testing-library/react-native";
import { Image } from "react-native";
import PostcardFront from "@/src/features/user/map/postcard/components/PostcardFront";

describe("PostcardFront", () => {
  it("renderiza o nome da cidade e a imagem do postal", () => {
    // Arrange
    render(
      <PostcardFront
        cityImage="https://cdn.example.com/recife.jpg"
        cityName="Recife"
      />
    );

    // Act
    const cityName = screen.getByText("Recife");
    const image = screen.UNSAFE_getByType(Image);

    // Assert
    expect(cityName).toBeTruthy();
    expect(image.props.source).toEqual({
      uri: "https://cdn.example.com/recife.jpg",
    });
  });
});
