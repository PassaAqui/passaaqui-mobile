import type {
  TravelHistoryItem,
  TravelHistoryRaw,
} from "@/src/features/user/settings/types/travelHistory";

export const visitedPoiRaw: TravelHistoryRaw = {
  visit_id: 1,
  poi_id: 10,
  poi_name: "Cristo Redentor",
  poi_description: "Monumento e ponto turístico histórico",
  image_url: "http://localhost:9000/passaaqui-bucket/pois/10.jpg",
  poi_type: "TOURIST_POINT",
  city_name: "Rio de Janeiro",
  xp_earned: 50,
  distance_km: 1.25,
  visited_at: "2026-05-24T14:30:00",
};

export const visitedPoi: TravelHistoryItem = {
  visitId: 1,
  poiId: 10,
  poiName: "Cristo Redentor",
  poiDescription: "Monumento e ponto turístico histórico",
  imageUrl: "http://localhost:9000/passaaqui-bucket/pois/10.jpg",
  poiType: "TOURIST_POINT",
  cityName: "Rio de Janeiro",
  xpEarned: 50,
  distanceKm: 1.25,
  visitedAt: "2026-05-24T14:30:00",
};

export const visitedPoiWithoutImageRaw: TravelHistoryRaw = {
  visit_id: 4,
  poi_id: 31,
  poi_name: "Marco Zero",
  poi_description: "Praça no coração do Recife Antigo",
  image_url: null,
  poi_type: "TOURIST_POINT",
  city_name: "Recife",
  xp_earned: 40,
  distance_km: 0.8,
  visited_at: "2026-09-18T16:10:00",
};

export const visitedPoiWithoutImage: TravelHistoryItem = {
  visitId: 4,
  poiId: 31,
  poiName: "Marco Zero",
  poiDescription: "Praça no coração do Recife Antigo",
  imageUrl: null,
  poiType: "TOURIST_POINT",
  cityName: "Recife",
  xpEarned: 40,
  distanceKm: 0.8,
  visitedAt: "2026-09-18T16:10:00",
};

export const travelHistoryRaw: TravelHistoryRaw[] = [
  visitedPoiWithoutImageRaw,
  visitedPoiRaw,
];

export const travelHistory: TravelHistoryItem[] = [
  visitedPoiWithoutImage,
  visitedPoi,
];

export const emptyTravelHistoryRaw: TravelHistoryRaw[] = [];

export const emptyTravelHistory: TravelHistoryItem[] = [];

export function createAxiosError(status: number) {
  const error = new Error("Request failed") as Error & {
    isAxiosError: boolean;
    response: { status: number; data: unknown };
  };

  error.isAxiosError = true;
  error.response = { status, data: {} };

  return error;
}