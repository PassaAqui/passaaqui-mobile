import { api } from "@/src/services/api/api";
import { RouteMode } from "@/src/services/routeService";

export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

// ===== Busca por proximidade (mapa) =====

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

interface PoiNearbyRaw {
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
    distanceLabel: formatDistance(raw.distance_km)
  };
}

// Buscar detalhes do POI por ID, incluindo os produtos presentes nele
export interface PoiProduct {
  id: number;
  name: string;
  description: string | null;
  price: number;
  maxXp: number | null;
  stock: number;
  shopkeeperId: number;
  categoryId: number;
}

export interface PoiDetail {
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
  products: PoiProduct[];
}

interface PoiProductRaw {
  id: number;
  name: string;
  description: string | null;
  price: number;
  max_xp: number | null;
  stock: number;
  shopkeeper_id: number;
  category_id: number;
}

interface PoiDetailRaw {
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
  products: PoiProductRaw[];
}

function normalizeProduct(raw: PoiProductRaw): PoiProduct {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    price: raw.price,
    maxXp: raw.max_xp,
    stock: raw.stock,
    shopkeeperId: raw.shopkeeper_id,
    categoryId: raw.category_id,
  };
}

function normalizePoiDetail(raw: PoiDetailRaw): PoiDetail {
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
    products: raw.products.map(normalizeProduct),
  };
}

export async function getPoisNearby(latitude: number, longitude: number, mode: RouteMode = "driving-car"): Promise<PoiNearby[]> {
  const { data } = await api.get<PoiNearbyRaw[]>("/pois", {
    params: { latitude, longitude, mode },
  });
  console.log("[poiService LOG] - POIs próximos encontrados: ", data)
  return data.map(normalizePoi);
}

export async function getPoiById(id: number): Promise<PoiDetail> {
  const { data } = await api.get<PoiDetailRaw>(`/pois/${id}`);
  console.log("[poiService LOG] - Resultado da busca do POI por id: ", data)
  return normalizePoiDetail(data);
}