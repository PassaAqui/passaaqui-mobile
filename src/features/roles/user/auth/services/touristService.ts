import { api } from "@/src/services/api/api"
import axios from "axios";

export interface TouristProfile {
  id: number;
  name: string,
  currentXP: number
}

export async function getTouristMe(): Promise<TouristProfile> {
  try {
    const { data } = await api.get("/tourists/me");
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("[getTouristMe ERROR] - status:", error.response?.status);
      console.log("[getTouristMe ERROR] - body:", error.response?.data);
    }
    throw error;
  }
}