export type TravelHistoryRaw = {
  visit_id: number;
  poi_id: number;
  poi_name: string;
  poi_description: string;
  image_url: string | null;
  poi_type: string;
  city_name: string;
  xp_earned: number;
  distance_km: number;
  visited_at: string; // ISO sem timezone, ex: "2026-05-24T14:30:00"
};

export type TravelHistoryItem = {
  visitId: number;
  poiId: number;
  poiName: string;
  poiDescription: string;
  imageUrl: string | null;
  poiType: string;
  cityName: string;
  xpEarned: number;
  distanceKm: number;
  visitedAt: string; // ISO sem timezone, ex: "2026-05-24T14:30:00"
};