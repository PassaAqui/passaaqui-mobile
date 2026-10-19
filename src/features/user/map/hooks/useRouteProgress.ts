import { useEffect, useMemo, useState } from "react";
import {
  buildRemainingRoute,
  computeRouteProgress,
  prepareRoute,
  type LatLng,
  type PreparedRoute,
  type RouteProgressOptions,
  type RouteProgressState,
} from "@/src/features/user/map/utils/routeProgress";

interface UseRouteProgressParams {
  /** Traçado completo da rota (fonte da verdade, não é mutado). */
  routeCoords: LatLng[];
  /** Posição atual do usuário (GPS real ou posição simulada). */
  position: LatLng | null;
  /** Indica se há navegação ativa. */
  active: boolean;
  options?: RouteProgressOptions;
}

interface ProgressState {
  /** Rota à qual o progresso pertence (detecta troca/reinício de rota). */
  route: PreparedRoute | null;
  progress: RouteProgressState | null;
}

/**
 * Acompanha o progresso da navegação e devolve o trecho restante da rota.
 *
 * O progresso é reiniciado automaticamente quando a rota muda (nova navegação,
 * troca de destino ou restauração de sessão). Atualizações de GPS que não
 * avançam de forma significativa não geram re-render.
 */
export function useRouteProgress({
  routeCoords,
  position,
  active,
  options,
}: UseRouteProgressParams) {
  const prepared = useMemo(() => prepareRoute(routeCoords), [routeCoords]);
  const [state, setState] = useState<ProgressState>({ route: null, progress: null });

  useEffect(() => {
    if (!active || !prepared || !position) return;

    setState((previous) => {
      const previousProgress = previous.route === prepared ? previous.progress : null;
      const result = computeRouteProgress(prepared, position, previousProgress, options);

      if (!result.advanced || !result.state) {
        return previous;
      }

      return { route: prepared, progress: result.state };
    });
  }, [active, prepared, position, options]);

  const progress = state.route === prepared ? state.progress : null;

  const remainingRouteCoords = useMemo(() => {
    if (!prepared || !progress) return routeCoords;
    return buildRemainingRoute(prepared, progress.distanceAlong, options);
  }, [prepared, progress, routeCoords, options]);

  return { remainingRouteCoords };
}
