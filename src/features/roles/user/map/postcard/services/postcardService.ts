import { api } from "@/src/services/api/api";

interface CityLocateApiResponse {
  id: number,
  name: string,
  description: string,
  imageUrl?: string
}

export interface CityResponse {
  cityId: number,
  cityName: string,
  chronicle: string,
  cityImage?: string
}

export async function getCityData(latitude: number, longitude: number): Promise<CityResponse | null> {
  try {
    const response = await api.post<CityLocateApiResponse>("/city/locate", { latitude, longitude });
    const city = response.data;

    return {
      cityId: city.id,
      cityName: city.name,
      cityImage: city.imageUrl,
      chronicle: city.description,
    }
  } catch (error: any) {
    console.log("[cityService ERROR] - Erro ao buscar cidade:", error?.response?.status, error?.response?.data ?? error?.message);
    if (error?.response?.status === 404) {
      return null;
    }
    throw error;
  }
}