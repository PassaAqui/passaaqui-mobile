import { renderHook, waitFor } from "@testing-library/react-native";
import { useRouteProgress } from "@/src/features/user/map/hooks/useRouteProgress";
import type { LatLng } from "@/src/features/user/map/utils/routeProgress";
import {
  straightRouteCoords,
  uTurnRouteCoords,
} from "@/src/features/user/map/__tests__/fixtures/map";

describe("useRouteProgress", () => {
  it("devolve a rota completa quando não há posição", () => {
    // Arrange / Act
    const { result } = renderHook(() =>
      useRouteProgress({
        routeCoords: straightRouteCoords,
        position: null,
        active: true,
      })
    );

    // Assert
    expect(result.current.remainingRouteCoords).toEqual(straightRouteCoords);
  });

  it("devolve a rota completa quando a navegação está inativa", () => {
    // Arrange / Act
    const { result } = renderHook(() =>
      useRouteProgress({
        routeCoords: straightRouteCoords,
        position: { latitude: -8.0675, longitude: -34.9 },
        active: false,
      })
    );

    // Assert
    expect(result.current.remainingRouteCoords).toEqual(straightRouteCoords);
  });

  it("recorta o trecho percorrido e preserva o destino", async () => {
    // Arrange
    const { result, rerender } = renderHook(
      ({ position }: { position: LatLng | null }) =>
        useRouteProgress({ routeCoords: straightRouteCoords, position, active: true }),
      { initialProps: { position: null as LatLng | null } }
    );

    // Act
    rerender({ position: { latitude: -8.0675, longitude: -34.9117 } });

    // Assert
    await waitFor(() =>
      expect(result.current.remainingRouteCoords[0].longitude).toBeGreaterThan(
        straightRouteCoords[0].longitude
      )
    );
    const remaining = result.current.remainingRouteCoords;
    expect(remaining[remaining.length - 1]).toEqual(straightRouteCoords[2]);
    expect(remaining[0].longitude).toBeCloseTo(-34.9117, 4);
  });

  it("avança com novas posições e não regride com oscilação de GPS", async () => {
    // Arrange
    const { result, rerender } = renderHook(
      ({ position }: { position: LatLng | null }) =>
        useRouteProgress({ routeCoords: straightRouteCoords, position, active: true }),
      { initialProps: { position: null as LatLng | null } }
    );

    // Act
    rerender({ position: { latitude: -8.0675, longitude: -34.9067 } });

    // Assert
    await waitFor(() => expect(result.current.remainingRouteCoords.length).toBe(2));
    expect(result.current.remainingRouteCoords[0].longitude).toBeCloseTo(-34.9067, 4);

    // Act — oscilação para trás
    rerender({ position: { latitude: -8.0675, longitude: -34.9117 } });

    // Assert — mantém o trecho já recortado
    await waitFor(() => expect(result.current.remainingRouteCoords.length).toBe(2));
    expect(result.current.remainingRouteCoords[0].longitude).toBeCloseTo(-34.9067, 4);
  });

  it("reinicia o progresso ao trocar a rota", async () => {
    // Arrange
    const { result, rerender } = renderHook(
      ({ position, routeCoords }: { position: LatLng | null; routeCoords: LatLng[] }) =>
        useRouteProgress({ routeCoords, position, active: true }),
      {
        initialProps: {
          position: null as LatLng | null,
          routeCoords: straightRouteCoords,
        },
      }
    );
    rerender({
      position: { latitude: -8.0675, longitude: -34.9067 },
      routeCoords: straightRouteCoords,
    });

    // Assert — progresso parcial na primeira rota
    await waitFor(() => expect(result.current.remainingRouteCoords.length).toBe(2));

    // Act — nova rota, posição no início dela
    rerender({
      position: uTurnRouteCoords[0],
      routeCoords: uTurnRouteCoords,
    });

    // Assert — progresso reiniciado, rota nova completa
    await waitFor(() =>
      expect(result.current.remainingRouteCoords.length).toBe(uTurnRouteCoords.length)
    );
  });
});
