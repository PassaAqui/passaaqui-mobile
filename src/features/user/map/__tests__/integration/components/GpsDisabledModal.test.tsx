import { fireEvent, render, screen } from "@testing-library/react-native";
import { Linking, Platform } from "react-native";
import GpsDisabledModal from "@/src/features/user/map/components/GpsDisabledModal";

describe("GpsDisabledModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest
      .spyOn(Linking, "openSettings")
      .mockImplementation(() => Promise.resolve());
    jest
      .spyOn(Linking, "openURL")
      .mockImplementation(() => Promise.resolve());
  });

  afterEach(() => {
    jest.restoreAllMocks();
    Platform.OS = "ios";
  });

  it("renderiza o alerta de GPS desativado", () => {
    // Arrange
    render(<GpsDisabledModal />);

    // Act
    const title = screen.getByText("ATENÇÂO!");
    const button = screen.getByText("Ir até as configurações");

    // Assert
    expect(title).toBeTruthy();
    expect(button).toBeTruthy();
  });

  it("no Android abre as configurações via Linking.openSettings", () => {
    // Arrange
    Platform.OS = "android";
    render(<GpsDisabledModal />);

    // Act
    fireEvent.press(screen.getByText("Ir até as configurações"));

    // Assert
    expect(Linking.openSettings).toHaveBeenCalledTimes(1);
    expect(Linking.openURL).not.toHaveBeenCalled();
  });

  it("no iOS abre app-settings via Linking.openURL", () => {
    // Arrange
    Platform.OS = "ios";
    render(<GpsDisabledModal />);

    // Act
    fireEvent.press(screen.getByText("Ir até as configurações"));

    // Assert
    expect(Linking.openURL).toHaveBeenCalledWith("app-settings");
    expect(Linking.openSettings).not.toHaveBeenCalled();
  });
});
