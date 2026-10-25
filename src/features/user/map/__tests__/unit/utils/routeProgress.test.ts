import {
  buildRemainingRoute,
  computeRouteProgress,
  prepareRoute,
  projectOnRoute,
} from "@/src/features/user/map/utils/routeProgress";
import {
  straightRouteCoords,
  uTurnRouteCoords,
} from "@/src/features/user/map/__tests__/fixtures/map";

describe("routeProgress", () => {
  describe("prepareRoute", () => {
    it("retorna null para rota com menos de 2 pontos", () => {
      // Arrange / Act / Assert
      expect(prepareRoute([])).toBeNull();
      expect(prepareRoute([{ latitude: -8, longitude: -34 }])).toBeNull();
      expect(prepareRoute(null)).toBeNull();
    });

    it("retorna null quando há coordenada inválida", () => {
      // Arrange
      const coords = [
        { latitude: -8, longitude: -34 },
        { latitude: Number.NaN, longitude: -34.1 },
      ];

      // Act / Assert
      expect(prepareRoute(coords)).toBeNull();
    });

    it("calcula a distância acumulada e o comprimento total", () => {
      // Arrange / Act
      const prepared = prepareRoute(straightRouteCoords)!;

      // Assert
      expect(prepared.cumulative[0]).toBe(0);
      expect(prepared.cumulative[1]).toBeGreaterThan(0);
      expect(prepared.cumulative[2]).toBeGreaterThan(prepared.cumulative[1]);
      expect(prepared.totalLength).toBeCloseTo(prepared.cumulative[2], 5);
      expect(prepared.totalLength).toBeGreaterThan(2000);
    });
  });

  describe("projectOnRoute", () => {
    it("projeta exatamente sobre um vértice", () => {
      // Arrange
      const prepared = prepareRoute(straightRouteCoords)!;

      // Act
      const projection = projectOnRoute(prepared, straightRouteCoords[1])!;

      // Assert
      expect(projection.segmentIndex).toBe(0);
      expect(projection.distanceAlong).toBeCloseTo(prepared.cumulative[1], 5);
      expect(projection.distanceFromRoute).toBeLessThan(0.01);
    });

    it("projeta no meio do segmento", () => {
      // Arrange
      const prepared = prepareRoute(straightRouteCoords)!;
      const middle = { latitude: -8.0675, longitude: -34.9117 };

      // Act
      const projection = projectOnRoute(prepared, middle)!;

      // Assert
      expect(projection.segmentIndex).toBe(0);
      expect(projection.distanceAlong).toBeCloseTo(prepared.cumulative[1] / 2, 0);
      expect(projection.snapPoint.longitude).toBeCloseTo(middle.longitude, 5);
    });

    it("retorna null para posição inválida", () => {
      // Arrange
      const prepared = prepareRoute(straightRouteCoords)!;

      // Act / Assert
      expect(projectOnRoute(prepared, { latitude: Number.NaN, longitude: -34 })).toBeNull();
    });

    it("respeita o índice inicial para não voltar a trechos paralelos", () => {
      // Arrange
      const prepared = prepareRoute(uTurnRouteCoords)!;
      // Ponto entre a ida e a volta, mais próximo do trecho de ida.
      const position = { latitude: -8.0004, longitude: -34.895 };

      // Act
      const fromStart = projectOnRoute(prepared, position, 0)!;
      const fromReturn = projectOnRoute(prepared, position, 2)!;

      // Assert
      expect(fromStart.segmentIndex).toBe(0);
      expect(fromReturn.segmentIndex).toBe(2);
    });
  });

  describe("buildRemainingRoute", () => {
    it("devolve a rota completa quando nada foi percorrido", () => {
      // Arrange
      const prepared = prepareRoute(straightRouteCoords)!;

      // Act / Assert
      expect(buildRemainingRoute(prepared, 0)).toEqual(straightRouteCoords);
    });

    it("devolve um trecho vazio ao chegar ao destino", () => {
      // Arrange
      const prepared = prepareRoute(straightRouteCoords)!;

      // Act / Assert
      expect(buildRemainingRoute(prepared, prepared.totalLength)).toEqual([]);
    });

    it("remove o trecho percorrido e preserva o destino", () => {
      // Arrange
      const prepared = prepareRoute(straightRouteCoords)!;

      // Act
      const remaining = buildRemainingRoute(prepared, prepared.totalLength / 2);

      // Assert
      expect(remaining.length).toBeGreaterThanOrEqual(2);
      expect(remaining[remaining.length - 1]).toEqual(straightRouteCoords[2]);
      expect(remaining[0].longitude).toBeGreaterThan(straightRouteCoords[0].longitude);
      expect(remaining[0].longitude).toBeLessThan(straightRouteCoords[2].longitude);
    });
  });

  describe("computeRouteProgress", () => {
    it("no primeiro update, avança até a projeção", () => {
      // Arrange
      const prepared = prepareRoute(straightRouteCoords)!;
      const position = { latitude: -8.0675, longitude: -34.9117 };

      // Act
      const result = computeRouteProgress(prepared, position, null);

      // Assert
      expect(result.advanced).toBe(true);
      expect(result.offRoute).toBe(false);
      expect(result.state!.distanceAlong).toBeGreaterThan(0);
    });

    it("avança de forma monotônica em updates sucessivos", () => {
      // Arrange
      const prepared = prepareRoute(straightRouteCoords)!;

      // Act
      const first = computeRouteProgress(
        prepared,
        { latitude: -8.0675, longitude: -34.912 },
        null
      );
      const second = computeRouteProgress(
        prepared,
        { latitude: -8.0675, longitude: -34.9 },
        first.state
      );

      // Assert
      expect(second.advanced).toBe(true);
      expect(second.state!.distanceAlong).toBeGreaterThan(first.state!.distanceAlong);
    });

    it("não regride com oscilação de GPS", () => {
      // Arrange
      const prepared = prepareRoute(straightRouteCoords)!;
      const advanced = computeRouteProgress(
        prepared,
        { latitude: -8.0675, longitude: -34.9 },
        null
      );

      // Act
      const oscillation = computeRouteProgress(
        prepared,
        { latitude: -8.0675, longitude: -34.91 },
        advanced.state
      );

      // Assert
      expect(oscillation.advanced).toBe(false);
      expect(oscillation.state).toBe(advanced.state);
    });

    it("ignora avanço pequeno (ruído) abaixo do mínimo", () => {
      // Arrange
      const prepared = prepareRoute(straightRouteCoords)!;
      const first = computeRouteProgress(
        prepared,
        { latitude: -8.0675, longitude: -34.91 },
        null
      );

      // Act
      const next = computeRouteProgress(
        prepared,
        { latitude: -8.0675, longitude: -34.90999 },
        first.state
      );

      // Assert
      expect(next.advanced).toBe(false);
      expect(next.state).toBe(first.state);
    });

    it("congela o progresso quando o usuário está fora da rota", () => {
      // Arrange
      const prepared = prepareRoute(straightRouteCoords)!;
      const first = computeRouteProgress(
        prepared,
        { latitude: -8.0675, longitude: -34.91 },
        null
      );

      // Act
      const offRoute = computeRouteProgress(
        prepared,
        { latitude: -8.1, longitude: -34.9 },
        first.state
      );

      // Assert
      expect(offRoute.offRoute).toBe(true);
      expect(offRoute.advanced).toBe(false);
      expect(offRoute.state).toBe(first.state);
    });

    it("não inicia progresso quando o primeiro update já está fora da rota", () => {
      // Arrange
      const prepared = prepareRoute(straightRouteCoords)!;

      // Act
      const result = computeRouteProgress(
        prepared,
        { latitude: -8.2, longitude: -34.9 },
        null
      );

      // Assert
      expect(result.offRoute).toBe(true);
      expect(result.state).toBeNull();
    });

    it("em rota com retorno, não volta para o segmento paralelo anterior", () => {
      // Arrange
      const prepared = prepareRoute(uTurnRouteCoords)!;
      const onReturn = computeRouteProgress(
        prepared,
        { latitude: -8.001, longitude: -34.895 },
        null
      );
      expect(onReturn.state!.segmentIndex).toBe(2);

      // Act
      // Ponto mais próximo da ida, mas com progresso anterior na volta.
      const ambiguous = computeRouteProgress(
        prepared,
        { latitude: -8.0004, longitude: -34.895 },
        onReturn.state
      );

      // Assert
      expect(ambiguous.state!.segmentIndex).toBe(2);
      expect(ambiguous.state!.distanceAlong).toBeGreaterThanOrEqual(
        onReturn.state!.distanceAlong
      );
    });
  });
});
