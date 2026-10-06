import { act, renderHook } from "@testing-library/react-native";
import { useSimulationAlert } from "@/src/features/user/map/hooks/useSimulationAlert";
import { useSimulationAlertStore } from "@/src/stores/user/map/simulationAlertStore";

let mockIsSimulatingEnable = true;

jest.mock("@/src/constants/user/map/simulation", () => ({
  get isSimulatingEnable() {
    return mockIsSimulatingEnable;
  },
}));

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

beforeEach(() => {
  jest.clearAllMocks();
  mockIsSimulatingEnable = true;
  useSimulationAlertStore.setState({ hasSeenSimulationAlert: false });
});

describe("useSimulationAlert", () => {
  it("deve exibir o alerta quando a simulação está habilitada e o usuário ainda não viu", () => {
    // Act
    const { result } = renderHook(() => useSimulationAlert());

    // Assert
    expect(result.current.shouldShowSimulationAlert).toBe(true);
  });

  it("não deve exibir o alerta quando o usuário já acknowledgeou", () => {
    // Arrange
    useSimulationAlertStore.setState({ hasSeenSimulationAlert: true });

    // Act
    const { result } = renderHook(() => useSimulationAlert());

    // Assert
    expect(result.current.shouldShowSimulationAlert).toBe(false);
  });

  it("não deve exibir o alerta quando a simulação está desabilitada", () => {
    // Arrange
    mockIsSimulatingEnable = false;

    // Act
    const { result } = renderHook(() => useSimulationAlert());

    // Assert
    expect(result.current.shouldShowSimulationAlert).toBe(false);
  });

  it("acknowledgeSimulationAlert grava o flag e esconde o alerta", () => {
    // Arrange
    const { result } = renderHook(() => useSimulationAlert());

    // Act
    act(() => {
      result.current.acknowledgeSimulationAlert();
    });

    // Assert
    expect(useSimulationAlertStore.getState().hasSeenSimulationAlert).toBe(true);
    expect(result.current.shouldShowSimulationAlert).toBe(false);
  });
});
