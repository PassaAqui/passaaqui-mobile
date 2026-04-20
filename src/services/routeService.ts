const ORS_API_KEY = "";
const ORS_BASE_URL = "";

interface Coordinate {
  latitude: number,
  longitude: number
}

interface RouteResult {
  coordinates: Coordinate[],
  distance: string,
  duration: number
}

type RouteMode = "driving-car" | "foot-walking" | "cycling-regular";

export async function getRoute(origin: Coordinate, destination: Coordinate, mode: RouteMode = "foot-walking"): Promise<RouteResult> {
  try {
    const response = await fetch(`${ORS_BASE_URL}/directions/${mode}?api_key=${ORS_API_KEY}&start=${origin.longitude},${origin.latitude}&end=${destination.longitude}, ${destination.latitude}`);
    
    if (!response.ok) {
      throw new Error(`[OpenRoute ERROR]: Erro na API ${response.status}`);
    }

    const data = await response.json();

    if (!data.features || data.features.length === 0) {
      throw new Error("[OpenRoute ERROR]: Nenhuma rota encontrada.");
    }

    const coordinates: Coordinate[] = data.features[0].geometry.coordinates.map(([longitude, latitude]: [number, number]) => ({
      latitude: latitude,
      longitude: longitude
    }));

    const summary = data.features[0].properties.summary;

    const distance = (summary.distance / 1000).toFixed(1);
    const duration = Math.round(summary.duration / 60);

    return {
      coordinates,
      distance,
      duration
    }
  } catch (error) {
    console.log(`[OpenRoute ERROR]: Erro ao buscar rota ${error}`);
    throw error;
  }
}
