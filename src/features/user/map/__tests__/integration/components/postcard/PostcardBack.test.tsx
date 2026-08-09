import { render, screen } from "@testing-library/react-native";
import { Image } from "react-native";
import PostcardBack from "@/src/features/user/map/postcard/components/PostcardBack";

describe("PostcardBack", () => {
  it("renderiza nome da cidade, crônica e imagem do postal", () => {
    // Arrange
    render(
      <PostcardBack
        cityImage="https://cdn.example.com/recife.jpg"
        cityName="Recife"
        chronicle="A Veneza brasileira"
      />
    );

    // Act
    const postalLabel = screen.getByText("POSTAL DA CIDADE");
    const cityName = screen.getByText("Recife");
    const chronicle = screen.getByText("A Veneza brasileira");
    const image = screen.UNSAFE_getByType(Image);

    // Assert
    expect(postalLabel).toBeTruthy();
    expect(cityName).toBeTruthy();
    expect(chronicle).toBeTruthy();
    expect(image.props.source).toEqual({
      uri: "https://cdn.example.com/recife.jpg",
    });
  });
});
