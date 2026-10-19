/**
 * Cálculo do progresso da navegação sobre a geometria da rota.
 *
 * Responsabilidade: dado o traçado completo da rota e a posição atual do
 * usuário, devolver o trecho que ainda falta percorrer (para a linha do mapa
 * "sumir" conforme o avanço). Toda a matemática fica aqui, sem I/O e sem
 * estado — os hooks apenas orquestram.
 *
 * A projeção usa uma aproximação planar equiretangular ancorada no primeiro
 * ponto da rota. Como as rotas são de escala urbana, o erro é desprezível e o
 * cálculo fica simples, estável e determinístico para testes.
 */

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface PreparedRoute {
  coords: LatLng[];
  /** Coordenadas projetadas em metros no plano local (ancorado em coords[0]). */
  points: { x: number; y: number }[];
  /** cumulative[i] = distância (m) de coords[0] até coords[i]. */
  cumulative: number[];
  totalLength: number;
}

/** Estado monotônico do progresso ao longo da rota. */
export interface RouteProgressState {
  /** Distância já avançada sobre a geometria, em metros. */
  distanceAlong: number;
  /** Índice do segmento onde a projeção atual caiu. */
  segmentIndex: number;
}

export interface RouteProgressOptions {
  /** Acima desta distância perpendicular, considera-se que o usuário saiu da rota. */
  offRouteThresholdMeters?: number;
  /** Avanço mínimo (m) para valer uma atualização de estado. */
  minAdvanceMeters?: number;
  /** Tolerância (m) para considerar que o usuário chegou ao destino. */
  epsilonMeters?: number;
}

export interface RouteProjection {
  distanceAlong: number;
  segmentIndex: number;
  distanceFromRoute: number;
  snapPoint: LatLng;
}

export interface RouteProgressResult {
  state: RouteProgressState | null;
  projection: RouteProjection | null;
  offRoute: boolean;
  advanced: boolean;
}

export const ROUTE_PROGRESS_DEFAULTS: Required<RouteProgressOptions> = {
  offRouteThresholdMeters: 50,
  minAdvanceMeters: 3,
  epsilonMeters: 0.5,
};

const EARTH_RADIUS_M = 6371000;
const POINT_EPSILON = 1e-9;

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function isValidCoord(coord: LatLng | null | undefined): coord is LatLng {
  return (
    !!coord &&
    Number.isFinite(coord.latitude) &&
    Number.isFinite(coord.longitude)
  );
}

/**
 * Valida e pré-calcula a rota (comprimentos e distância acumulada por
 * segmento). Retorna `null` quando não há geometria utilizável.
 */
export function prepareRoute(coords: LatLng[] | null | undefined): PreparedRoute | null {
  if (!Array.isArray(coords) || coords.length < 2) return null;
  if (!coords.every(isValidCoord)) return null;

  const origin = coords[0];
  const latRad = toRad(origin.latitude);
  const cosLat = Math.cos(latRad);

  const points = coords.map((coord) => ({
    x: toRad(coord.longitude - origin.longitude) * cosLat * EARTH_RADIUS_M,
    y: toRad(coord.latitude - origin.latitude) * EARTH_RADIUS_M,
  }));

  const cumulative: number[] = [0];
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    cumulative.push(cumulative[i - 1] + Math.hypot(dx, dy));
  }

  return {
    coords: coords.map((coord) => ({ ...coord })),
    points,
    cumulative,
    totalLength: cumulative[cumulative.length - 1],
  };
}

/**
 * Projeta a posição na rota e devolve o ponto mais próximo.
 *
 * `fromSegmentIndex` limita a busca aos segmentos a partir do índice indicado.
 * Isso evita que, em rotas com trechos próximos/paralelos (curvas, retornos),
 * a projeção "volte" para um segmento já percorrido.
 */
export function projectOnRoute(
  prepared: PreparedRoute,
  position: LatLng,
  fromSegmentIndex = 0
): RouteProjection | null {
  if (!isValidCoord(position)) return null;

  const { coords, points, cumulative } = prepared;
  const origin = coords[0];
  const cosLat = Math.cos(toRad(origin.latitude));

  const px = toRad(position.longitude - origin.longitude) * cosLat * EARTH_RADIUS_M;
  const py = toRad(position.latitude - origin.latitude) * EARTH_RADIUS_M;

  const start = Math.min(
    Math.max(Math.floor(fromSegmentIndex), 0),
    points.length - 2
  );

  let best: RouteProjection | null = null;

  for (let i = start; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const lengthSq = dx * dx + dy * dy;

    let t = lengthSq > 0 ? ((px - a.x) * dx + (py - a.y) * dy) / lengthSq : 0;
    t = Math.min(1, Math.max(0, t));

    const projX = a.x + t * dx;
    const projY = a.y + t * dy;
    const distanceFromRoute = Math.hypot(px - projX, py - projY);

    if (!best || distanceFromRoute < best.distanceFromRoute) {
      const segmentLength = cumulative[i + 1] - cumulative[i];
      best = {
        distanceAlong: cumulative[i] + t * segmentLength,
        segmentIndex: i,
        distanceFromRoute,
        snapPoint: {
          latitude: coords[i].latitude + t * (coords[i + 1].latitude - coords[i].latitude),
          longitude: coords[i].longitude + t * (coords[i + 1].longitude - coords[i].longitude),
        },
      };
    }
  }

  return best;
}

/**
 * Constrói o trecho restante a partir da distância já percorrida. O primeiro
 * ponto é o ponto projetado na rota (mantém a conexão visual com o marcador) e
 * o último é sempre o destino original. Devolve `[]` ao chegar.
 */
export function buildRemainingRoute(
  prepared: PreparedRoute,
  distanceAlong: number,
  options?: RouteProgressOptions
): LatLng[] {
  const { epsilonMeters } = { ...ROUTE_PROGRESS_DEFAULTS, ...(options ?? {}) };
  const { coords, cumulative, totalLength } = prepared;

  if (!Number.isFinite(distanceAlong)) return coords.map((coord) => ({ ...coord }));
  if (distanceAlong <= 0) return coords.map((coord) => ({ ...coord }));
  if (distanceAlong >= totalLength - epsilonMeters) return [];

  let i = 0;
  while (i < cumulative.length - 2 && cumulative[i + 1] < distanceAlong) i++;

  const segmentLength = cumulative[i + 1] - cumulative[i];
  const t = segmentLength > 0 ? (distanceAlong - cumulative[i]) / segmentLength : 0;

  const tail = coords.slice(i + 1).map((coord) => ({ ...coord }));
  const remaining =
    t >= 1 - POINT_EPSILON
      ? tail
      : [
          {
            latitude: coords[i].latitude + t * (coords[i + 1].latitude - coords[i].latitude),
            longitude: coords[i].longitude + t * (coords[i + 1].longitude - coords[i].longitude),
          },
          ...tail,
        ];

  const deduped = remaining.filter((coord, index) => {
    if (index === 0) return true;
    const prev = remaining[index - 1];
    return (
      Math.abs(coord.latitude - prev.latitude) > POINT_EPSILON ||
      Math.abs(coord.longitude - prev.longitude) > POINT_EPSILON
    );
  });

  // Um GeoJSON LineString precisa de pelo menos 2 pontos para ser desenhado.
  return deduped.length >= 2 ? deduped : [];
}

/**
 * Combina a projeção atual com o estado anterior, aplicando as regras de
 * robustez:
 * - progresso monotônico (nunca regride);
 * - ruído abaixo de `minAdvanceMeters` não gera avanço;
 * - posição fora da rota (`offRouteThresholdMeters`) congela o progresso;
 * - busca apenas a partir do segmento atual (evita trechos paralelos).
 */
export function computeRouteProgress(
  prepared: PreparedRoute,
  position: LatLng,
  previous: RouteProgressState | null,
  options?: RouteProgressOptions
): RouteProgressResult {
  const opts = { ...ROUTE_PROGRESS_DEFAULTS, ...(options ?? {}) };
  const fromSegmentIndex = previous ? Math.max(0, previous.segmentIndex - 1) : 0;
  const projection = projectOnRoute(prepared, position, fromSegmentIndex);

  if (!projection) {
    return { state: previous, projection: null, offRoute: false, advanced: false };
  }

  if (projection.distanceFromRoute > opts.offRouteThresholdMeters) {
    return { state: previous, projection, offRoute: true, advanced: false };
  }

  if (!previous) {
    return {
      state: {
        distanceAlong: projection.distanceAlong,
        segmentIndex: projection.segmentIndex,
      },
      projection,
      offRoute: false,
      advanced: true,
    };
  }

  const distanceAlong = Math.max(previous.distanceAlong, projection.distanceAlong);

  if (distanceAlong - previous.distanceAlong < opts.minAdvanceMeters) {
    return { state: previous, projection, offRoute: false, advanced: false };
  }

  return {
    state: {
      distanceAlong,
      segmentIndex:
        projection.distanceAlong >= previous.distanceAlong
          ? projection.segmentIndex
          : previous.segmentIndex,
    },
    projection,
    offRoute: false,
    advanced: true,
  };
}
