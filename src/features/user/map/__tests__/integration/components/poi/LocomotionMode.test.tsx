import { fireEvent, render, screen } from "@testing-library/react-native";
import LocomotionMode from "@/src/features/user/map/poi/components/LocomotionMode";

describe("LocomotionMode", () => {
  const onSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza as três opções de locomoção", () => {
    // Arrange
    render(<LocomotionMode onSelect={onSelect} />);

    // Act
    const walking = screen.getByText("A pé");
    const car = screen.getByText("Carro");
    const bike = screen.getByText("Bicicleta");

    // Assert
    expect(walking).toBeTruthy();
    expect(car).toBeTruthy();
    expect(bike).toBeTruthy();
  });

  it("seleciona foot-walking ao pressionar A pé", () => {
    // Arrange
    render(<LocomotionMode onSelect={onSelect} />);

    // Act
    fireEvent.press(screen.getByText("A pé"));

    // Assert
    expect(onSelect).toHaveBeenCalledWith("foot-walking");
  });

  it("seleciona driving-car ao pressionar Carro", () => {
    // Arrange
    render(<LocomotionMode onSelect={onSelect} />);

    // Act
    fireEvent.press(screen.getByText("Carro"));

    // Assert
    expect(onSelect).toHaveBeenCalledWith("driving-car");
  });

  it("seleciona cycling-regular ao pressionar Bicicleta", () => {
    // Arrange
    render(<LocomotionMode onSelect={onSelect} />);

    // Act
    fireEvent.press(screen.getByText("Bicicleta"));

    // Assert
    expect(onSelect).toHaveBeenCalledWith("cycling-regular");
  });
});
