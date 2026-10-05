import { api } from "@/src/services/api/api";
import { isAxiosError } from "axios";

export interface TouristProfile {
  id: number;
  name: string;
  email: string;
  currentXP: number;
  role?: string;
  theme?: "LIGHT" | "DARK";
  image?: string | null;
  imageUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
  deviceId?: string | null;
  documentId?: string;
  lastKnownLocation?: string | null;
  level?: number;
}

export async function getTouristMe(): Promise<TouristProfile> {
  try {
    const { data } = await api.get("/tourists/me");
    return data;
  } catch (error) {
    if (isAxiosError(error)) {
      console.log("[getTouristMe ERROR] - status:", error.response?.status);
      console.log("[getTouristMe ERROR] - body:", error.response?.data);
    }
    throw error;
  }
}
