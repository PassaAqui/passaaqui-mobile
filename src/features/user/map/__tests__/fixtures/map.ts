export const rawPoiNearby = {
  id: 1,
  name: "Marco Zero",
  description: "Praça histórica do Recife",
  xp_reward: 50,
  type: "TOURIST_POINT",
  latitude: -8.0632,
  longitude: -34.8711,
  average_rating: 4.8,
  ratings_count: 120,
  image: "https://cdn.example.com/marco-zero.jpg",
  distance_km: 1.24,
};

export const poiNearby = {
  id: 1,
  name: "Marco Zero",
  description: "Praça histórica do Recife",
  xpReward: 50,
  type: "TOURIST_POINT",
  latitude: -8.0632,
  longitude: -34.8711,
  averageRating: 4.8,
  ratingsCount: 120,
  image: "https://cdn.example.com/marco-zero.jpg",
  distanceKm: 1.24,
  distanceLabel: "1.2 km",
};

export const directionResponse = {
  features: [
    {
      geometry: {
        coordinates: [
          [-34.8711, -8.0632],
          [-34.8698, -8.0611],
        ],
      },
      properties: {
        summary: {
          distance: 1850,
          duration: 480,
        },
      },
    },
  ],
};

export const routeSession = {
  status: "ACTIVE",
  destination: {
    startLatitude: -8.0632,
    startLongitude: -34.8711,
    stopLatitude: -8.0506,
    stopLongitude: -34.8782,
    mode: "foot-walking",
    poiId: 1,
  },
  lastLocation: {
    latitude: -8.0608,
    longitude: -34.8699,
  },
};

export const cityLocateApiResponse = {
  id: 9,
  name: "Recife",
  description: "A Veneza brasileira",
  imageUrl: "https://cdn.example.com/recife.jpg",
};

export const cityResponse = {
  cityId: 9,
  cityName: "Recife",
  chronicle: "A Veneza brasileira",
  cityImage: "https://cdn.example.com/recife.jpg",
};

export function createAxiosError(status: number) {
  const error = new Error("Request failed") as Error & {
    isAxiosError: boolean;
    response: { status: number; data: unknown };
  };

  error.isAxiosError = true;
  error.response = { status, data: {} };

  return error;
}
