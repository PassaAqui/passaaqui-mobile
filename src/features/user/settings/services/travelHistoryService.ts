import { api } from "@/src/services/api/api";
import type {
  TravelHistoryItem,
  TravelHistoryRaw,
} from "@/src/features/user/settings/types/travelHistory";

function normalizeTravelHistoryItem(raw: TravelHistoryRaw): TravelHistoryItem {
  return {
    visitId: raw.visit_id,
    poiId: raw.poi_id,
    poiName: raw.poi_name,
    poiDescription: raw.poi_description,
    imageUrl: raw.image_url ?? null,
    poiType: raw.poi_type,
    cityName: raw.city_name,
    xpEarned: raw.xp_earned,
    distanceKm: raw.distance_km,
    visitedAt: raw.visited_at,
  };
}

export async function getTravelHistory(): Promise<TravelHistoryItem[]> {
  const { data } = await api.get<TravelHistoryRaw[]>("/tourists/me/travel-history");

  return data.map(normalizeTravelHistoryItem);
}