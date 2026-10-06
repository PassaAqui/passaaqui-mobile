import { fireEvent, render, screen } from "@testing-library/react-native";
import ShopkeeperPOI from "@/src/features/user/map/poi/components/ShopkeeperPOI";

jest.mock("expo-router", () => {
  const { View } = require("react-native");
  return {
    Link: ({
      children,
      href,
    }: {
      children: React.ReactNode;
      href: unknown;
    }) => <View testID="shop-link" href={href}>{children}</View>,
  };
});

describe("ShopkeeperPOI", () => {
  const onClose = jest.fn();
  const onNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  function renderPOI(overrides: Partial<React.ComponentProps<typeof ShopkeeperPOI>> = {}) {
    render(
      <ShopkeeperPOI
        poiId={7}
        img="https://cdn.example.com/cafe-recife.jpg"
        title="Café do Recife"
        description="Cafeteria no bairro do Recife"
        distance="800 m"
        starQuantity={5}
        visible
        onClose={onClose}
        onNavigate={onNavigate}
        {...overrides}
      />
    );
  }

  it("não renderiza o conteúdo quando visible é false", () => {
    // Arrange
    renderPOI({ visible: false });

    // Act
    const title = screen.queryByText("Café do Recife");

    // Assert
    expect(title).toBeNull();
  });

  it("renderiza título, descrição, distância e avaliações quando visible", () => {
    // Arrange
    renderPOI();

    // Act
    const title = screen.getByText("Café do Recife");
    const description = screen.getByText("Cafeteria no bairro do Recife");
    const distance = screen.getByText("800 m");
    const rating = screen.getByText("5");

    // Assert
    expect(title).toBeTruthy();
    expect(description).toBeTruthy();
    expect(distance).toBeTruthy();
    expect(rating).toBeTruthy();
  });

  it("chama onClose ao pressionar o botão X", () => {
    // Arrange
    renderPOI();

    // Act
    fireEvent.press(screen.getByText("X"));

    // Assert
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it("Ver produtos aponta para a loja do POI com o poiId", () => {
    // Arrange
    renderPOI();

    // Act
    const link = screen.getByTestId("shop-link");

    // Assert
    expect(screen.getByText("Ver produtos")).toBeTruthy();
    expect(link.props.href).toEqual({
      pathname: "/user/(private)/shop",
      params: { poiId: 7 },
    });
  });

  it("abre a seleção de modo ao pressionar Ir agora e navega ao escolher", () => {
    // Arrange
    renderPOI();

    // Act
    fireEvent.press(screen.getByText("Ir agora"));
    fireEvent.press(screen.getByText("Bicicleta"));

    // Assert
    expect(onNavigate).toHaveBeenCalledWith("cycling-regular");
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
