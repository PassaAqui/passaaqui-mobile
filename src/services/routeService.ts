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
