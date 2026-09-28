import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSimulationAlertStore } from "@/src/stores/user/map/simulationAlertStore";

// Mock do AsyncStorage com o mock oficial do pacote (em memória) — o persist do
// simulationAlertStore depende dele e o jest.setup.ts não cobre AsyncStorage.
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

const mockedAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

beforeEach(() => {
  jest.clearAllMocks();
  useSimulationAlertStore.setState({ hasSeenSimulationAlert: false });
});

describe("simulationAlertStore", () => {
  it("começa com hasSeenSimulationAlert falso para um usuário novo", () => {
    // Act
    const state = useSimulationAlertStore.getState();

    // Assert
    expect(state.hasSeenSimulationAlert).toBe(false);
  });

  describe("acknowledgeSimulationAlert", () => {
    it("marca o alerta como visto", () => {
      // Act
      useSimulationAlertStore.getState().acknowledgeSimulationAlert();

      // Assert
      expect(useSimulationAlertStore.getState().hasSeenSimulationAlert).toBe(true);
    });

    it("mantém o estado verdadeiro quando chamado mais de uma vez", () => {
      // Act
      useSimulationAlertStore.getState().acknowledgeSimulationAlert();
      useSimulationAlertStore.getState().acknowledgeSimulationAlert();

      // Assert
      expect(useSimulationAlertStore.getState().hasSeenSimulationAlert).toBe(true);
    });
  });

  describe("reset", () => {
    it("volta ao estado inicial para o alerta voltar a aparecer no próximo login", () => {
      // Arrange
      useSimulationAlertStore.setState({ hasSeenSimulationAlert: true });

      // Act
      useSimulationAlertStore.getState().reset();

      // Assert
      expect(useSimulationAlertStore.getState().hasSeenSimulationAlert).toBe(false);
    });
  });

  describe("persistência", () => {
    it("salva hasSeenSimulationAlert no AsyncStorage sob a chave simulation-alert-storage", () => {
      // Act
      useSimulationAlertStore.getState().acknowledgeSimulationAlert();

      // Assert
      expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith(
        "simulation-alert-storage",
        expect.any(String)
      );
    });
  });
});
