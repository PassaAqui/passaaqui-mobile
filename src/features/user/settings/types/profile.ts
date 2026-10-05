export interface UpdateTouristDTO {
  name?: string;
  password?: string;
  documentId?: string;
  theme?: "LIGHT" | "DARK";
}

export interface TouristProfileResponse {
  id: number;
  email: string;
  name: string;
  role: string;
  theme: "LIGHT" | "DARK";
  image?: string | null;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  deviceId: string | null;
  documentId: string;
  lastKnownLocation: string | null;
  currentXP: number;
  level: number;
}

export interface UpdateProfilePayload {
  name?: string;
}
