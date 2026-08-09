import { fireEvent, render, screen } from "@testing-library/react-native";
import TouristSpotPOI from "@/src/features/user/map/poi/components/TouristSpotPOI";

describe("TouristSpotPOI", () => {
  const onClose = jest.fn();
  const onNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  function renderPOI(overrides: Partial<React.ComponentProps<typeof TouristSpotPOI>> = {}) {
    render(
      <TouristSpotPOI
        img={{ uri: "https://cdn.example.com/marco-zero.jpg" }}
        title="Marco Zero"
        description="Praça histórica do Recife"
        distance="1.2 km"
        xpQuantity={50}
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
    const title = screen.queryByText("Marco Zero");

    // Assert
    expect(title).toBeNull();
  });

  it("renderiza título, descrição, distância e XP quando visible", () => {
    // Arrange
    renderPOI();

    // Act
    const title = screen.getByText("Marco Zero");
    const description = screen.getByText("Praça histórica do Recife");
    const distance = screen.getByText("1.2 km");
    const xp = screen.getByText(/50 XP/);

    // Assert
    expect(title).toBeTruthy();
    expect(description).toBeTruthy();
    expect(distance).toBeTruthy();
    expect(xp).toBeTruthy();
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

  it("abre a seleção de modo ao pressionar Ir agora e navega ao escolher", () => {
    // Arrange
    renderPOI();

    // Act
    fireEvent.press(screen.getByText("Ir agora"));
    fireEvent.press(screen.getByText("A pé"));

    // Assert
    expect(onNavigate).toHaveBeenCalledWith("foot-walking");
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
