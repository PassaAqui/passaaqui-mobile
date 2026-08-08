import AsyncStorage from "@react-native-async-storage/async-storage";
import { useVisitedCitiesStore } from "@/src/stores/user/map/visitedCitiesStore";

// Mock do AsyncStorage com o mock oficial do pacote (em memória) — o persist do
// visitedCitiesStore depende dele e o jest.setup.ts não cobre AsyncStorage.
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

const mockedAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

beforeEach(() => {
  jest.clearAllMocks();
  useVisitedCitiesStore.setState({ visitedCityIds: [] });
});

describe("visitedCitiesStore", () => {
  describe("markCityAsVisited", () => {
    it("adiciona o cityId à lista de cidades visitadas", () => {
      // Act
      useVisitedCitiesStore.getState().markCityAsVisited(9);

      // Assert
      expect(useVisitedCitiesStore.getState().visitedCityIds).toEqual([9]);
    });

    it("não duplica o cityId chamado duas vezes", () => {
      // Act
      useVisitedCitiesStore.getState().markCityAsVisited(9);
      useVisitedCitiesStore.getState().markCityAsVisited(9);

      // Assert
      expect(useVisitedCitiesStore.getState().visitedCityIds).toEqual([9]);
    });
  });

  describe("hasVisitedCity", () => {
    it("retorna true para cidade marcada e false para cidade não marcada", () => {
      // Arrange
      useVisitedCitiesStore.setState({ visitedCityIds: [9] });

      // Act
      const visited = useVisitedCitiesStore.getState().hasVisitedCity(9);
      const notVisited = useVisitedCitiesStore.getState().hasVisitedCity(10);

      // Assert
      expect(visited).toBe(true);
      expect(notVisited).toBe(false);
    });
  });

  describe("reset", () => {
    it("limpa a lista de cidades visitadas após marcações", () => {
      // Arrange
      useVisitedCitiesStore.setState({ visitedCityIds: [9, 10] });

      // Act
      useVisitedCitiesStore.getState().reset();

      // Assert
      expect(useVisitedCitiesStore.getState().visitedCityIds).toEqual([]);
    });
  });

  describe("persistência", () => {
    it("salva visitedCityIds no AsyncStorage sob a chave visited-cities-storage", async () => {
      // Act
      useVisitedCitiesStore.getState().markCityAsVisited(9);

      // Assert
      expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith(
        "visited-cities-storage",
        expect.any(String)
      );
    });
  });
});
