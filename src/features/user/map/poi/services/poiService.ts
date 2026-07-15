import { api } from "@/src/services/api/api";
import { RouteMode } from "@/src/services/routeService";

export interface PoiNearby {
  id: number;
  name: string;
  description: string | null;
  xpReward: number | null;
  type: "STORE" | "TOURIST_POINT";
  latitude: number;
  longitude: number;
  averageRating: number | null;
  ratingsCount: number | null;
  image: string | null;
  distanceKm: number;
  distanceLabel: string;
}

interface PoiNearbyRaw { // os campos do jeito q o back retorna (falar com meu backend dps pra padronizar com o resto da api)
  id: number;
  name: string;
  description: string | null;
  xp_reward: number | null;
  type: "STORE" | "TOURIST_POINT";
  latitude: number;
  longitude: number;
  average_rating: number | null;
  ratings_count: number | null;
  image: string | null;
  distance_km: number;
}

function normalizePoi(raw: PoiNearbyRaw): PoiNearby {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    xpReward: raw.xp_reward,
    type: raw.type,
    latitude: raw.latitude,
    longitude: raw.longitude,
    averageRating: raw.average_rating,
    ratingsCount: raw.ratings_count,
    image: raw.image,
    distanceKm: raw.distance_km,
    distanceLabel: formatDistance(raw.distance_km),
  };
}

export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

export async function getPoisNearby(latitude: number, longitude: number, mode: RouteMode = "driving-car"): Promise<PoiNearby[]> {
  const { data } = await api.get<PoiNearbyRaw[]>("/pois", {
    params: { latitude, longitude, mode },
  });
  console.log("[poiService LOG] - POIS encontrados:", data);
  return data.map(normalizePoi);
}