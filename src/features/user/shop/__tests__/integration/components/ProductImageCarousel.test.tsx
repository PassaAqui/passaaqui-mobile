import { fireEvent, render, screen } from "@testing-library/react-native";
import { Image, View } from "react-native";
import { ProductImageCarousel } from "@/src/features/user/shop/components/ProductImageCarousel";

jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    Ionicons: (props: { name: string }) => <Text>{`ionicon-${props.name}`}</Text>,
  };
});

jest.mock("react-native-image-viewing", () => {
  const React = require("react");
  const { View } = require("react-native");
  return (props: { visible: boolean }) => (
    <View testID="image-viewing" visible={props.visible} />
  );
});

const threeImages = [
  "https://cdn.example.com/cafe-1.jpg",
  "https://cdn.example.com/cafe-2.jpg",
  "https://cdn.example.com/cafe-3.jpg",
];

describe("ProductImageCarousel", () => {
  it("renderiza o placeholder no-image quando não há imagens", () => {
    // Arrange
    render(<ProductImageCarousel images={[]} />);

    // Act
    const images = screen.UNSAFE_getAllByType(Image);

    // Assert
    expect(images).toHaveLength(1);
    expect(screen.queryByText(/^ionicon-/)).toBeNull();
    expect(screen.queryByTestId("image-viewing")).toBeNull();
  });

  it("não renderiza setas nem dots com uma única imagem", () => {
    // Arrange
    render(<ProductImageCarousel images={["https://cdn.example.com/cafe.jpg"]} />);

    // Assert
    expect(screen.queryByText(/^ionicon-/)).toBeNull();
  });

  it("renderiza a seta avançar e três dots com três imagens (índice inicial 0)", () => {
    // Arrange
    render(<ProductImageCarousel images={threeImages} />);

    // Act
    const arrows = screen.getAllByText(/^ionicon-/);
    const dots = screen
      .UNSAFE_getAllByType(View)
      .filter(
        (view) =>
          (view.props.className ?? "").includes("rounded-full") &&
          (view.props.className ?? "").includes("bg-white")
      );

    // Assert
    expect(arrows).toHaveLength(1);
    expect(screen.getByText("ionicon-chevron-forward")).toBeTruthy();
    expect(dots).toHaveLength(3);
  });

  it("abre o fullscreen ao pressionar uma imagem", () => {
    // Arrange
    render(<ProductImageCarousel images={threeImages} />);

    // Act
    fireEvent.press(screen.UNSAFE_getAllByType(Image)[0]);

    // Assert
    expect(screen.getByTestId("image-viewing").props.visible).toBe(true);
  });

  it("navega para a próxima imagem ao pressionar a seta avançar", () => {
    // Arrange
    render(<ProductImageCarousel images={threeImages} />);

    // Act
    fireEvent.press(screen.getByText("ionicon-chevron-forward"));

    // Assert
    expect(screen.getByText("ionicon-chevron-back")).toBeTruthy();
    expect(screen.getByText("ionicon-chevron-forward")).toBeTruthy();
    expect(screen.getByTestId("image-viewing").props.visible).toBe(false);
  });
});
