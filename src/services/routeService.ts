import { api } from "@/src/services/api/api";

interface Coordinate {
  latitude: number,
  longitude: number
}

interface RouteDestination {
  startLatitude: number,
  startLongitude: number,
  stopLatitude: number,
  stopLongitude: number,
  mode: RouteMode,
  poiId?: number
}

export interface RouteSession {
  status: "ACTIVE" | string,
  destination: RouteDestination | null,
  lastLocation: Coordinate | null
}

interface StartRoutePayload {
  latitude?: number,
  longitude?: number,
  poiId?: number
}

interface DirectionPayload {
  mode: RouteMode,
  startLatitude: number,
  startLongitude: number,
  endLatitude: number,
  endLongitude: number,
  poiId?: number
}

interface DirectionResult {
  coordinates: Coordinate[],
  distance: string,
  duration: number
}

export interface CheckinResult {
  xp_concedido: number;
  calculo: {
    distancia_km: number;
    fator_deslocamento: number;
    visitas_recentes: number;
    fator_invisibilidade: number;
    xp_bruto: number;
    xp_final: number;
  } | null;
  regras_aplicadas: {
    anti_farming_ativo: boolean;
    gps_invalido: boolean;
  };
  motivo_bloqueio: string | null;
}

/**
 * Contrato real devolvido pelo backend no POST /pois/{id}/checkin e no push
 * WebSocket `checkin-result`. O backend padronizou esses campos em inglês;
 * `normalizeCheckinResult` mantém o contrato interno do app estável.
 */
export interface CheckinApiResponse {
  xp_granted?: number;
  calculation?: {
    distance_km: number;
    displacement_factor: number;
    recent_visits: number;
    invisibility_factor: number;
    raw_xp: number;
    final_xp: number;
  } | null;
  applied_rules?: {
    anti_farming_active: boolean;
    invalid_gps: boolean;
  };
  block_reason?: string | null;
}

export function normalizeCheckinResult(data: CheckinApiResponse): CheckinResult {
  return {
    xp_concedido: data.xp_granted ?? 0,
    calculo: data.calculation
      ? {
          distancia_km: data.calculation.distance_km,
          fator_deslocamento: data.calculation.displacement_factor,
          visitas_recentes: data.calculation.recent_visits,
          fator_invisibilidade: data.calculation.invisibility_factor,
          xp_bruto: data.calculation.raw_xp,
          xp_final: data.calculation.final_xp,
        }
      : null,
    regras_aplicadas: {
      anti_farming_ativo: data.applied_rules?.anti_farming_active ?? false,
      gps_invalido: data.applied_rules?.invalid_gps ?? false,
    },
    motivo_bloqueio: data.block_reason ?? null,
  };
}

export type RouteMode = "driving-car" | "foot-walking" | "cycling-regular";

export async function startRouteSession(payload?: StartRoutePayload): Promise<RouteSession> {
  const { data } = await api.post("/route/start", payload ?? {});
  return data;
}

export async function getCurrentRouteSession(): Promise<RouteSession> {
  const { data } = await api.get("/route/current");
  return data;
}

export async function endRouteSession(): Promise<void> {
  await api.delete("/route/current");
}

export async function updateRouteLocation(payload: Coordinate): Promise<void> {
  await api.post("/route/location", payload);
}

export async function checkinAtPoi(poiId: number, distanceKm?: number): Promise<CheckinResult> {
  const { data } = await api.post<CheckinApiResponse>(`/pois/${poiId}/checkin`, { distanceKm });
  return normalizeCheckinResult(data);
}

function toRad(deg: number): number {
  return deg * Math.PI / 180;
}

export function haversineDistance(c1: Coordinate, c2: Coordinate): number {
  const R = 6371;
  const dLat = toRad(c2.latitude - c1.latitude);
  const dLon = toRad(c2.longitude - c1.longitude);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(c1.latitude)) * Math.cos(toRad(c2.latitude)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function calculateAccumulatedDistance(coords: Coordinate[]): number {
  let total = 0;
  for (let i = 1; i < coords.length; i++) {
    total += haversineDistance(coords[i - 1], coords[i]);
  }
  return Math.round(total * 100) / 100;
}

// Pega a rota para desenhar o trajeto no MapScreen
export async function getDirection(payload: DirectionPayload): Promise<DirectionResult> {
  const { data } = await api.post("/direction", payload);

  if (!data.features || data.features.length === 0) {
    throw new Error("[getDirection ERROR]: Nenhuma rota encontrada.");
  }

  const feature = data.features[0];

  const coordinates: Coordinate[] = feature.geometry.coordinates.map(
    ([longitude, latitude]: [number, number]) => ({ latitude, longitude })
  );

  const summary = feature.properties.summary;
  const distance = (summary.distance / 1000).toFixed(1);
  const duration = Math.round(summary.duration / 60);

  return { coordinates, distance, duration };
}
