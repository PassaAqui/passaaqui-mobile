import type { TouristProfileResponse } from "@/src/features/user/settings/types/profile";

export const AVATAR_URL = "http://localhost:9000/passaaqui-bucket/users/avatar-1.jpg";
export const UPDATED_AVATAR_URL =
  "http://localhost:9000/passaaqui-bucket/users/avatar-uuid.jpg";

export const touristProfile: TouristProfileResponse = {
  id: 1,
  email: "turista@email.com",
  name: "João Turista",
  role: "TOURIST",
  theme: "LIGHT",
  image: AVATAR_URL,
  imageUrl: AVATAR_URL,
  createdAt: "2026-05-24T10:00:00",
  updatedAt: "2026-05-24T10:00:00",
  deviceId: null,
  documentId: "12345678909",
  lastKnownLocation: null,
  currentXP: 0,
  level: 0,
};

export const updatedTouristProfile: TouristProfileResponse = {
  ...touristProfile,
  name: "João Turista Atualizado",
  image: UPDATED_AVATAR_URL,
  imageUrl: UPDATED_AVATAR_URL,
  updatedAt: "2026-05-24T12:00:00",
};

export const localAvatarUri = "file:///var/mobile/avatar-1.jpg";
export const localAvatarFileName = "avatar-1.jpg";

export function createAxiosError(status: number) {
  const error = new Error("Request failed") as Error & {
    isAxiosError: boolean;
    response: { status: number; data: unknown };
  };

  error.isAxiosError = true;
  error.response = { status, data: {} };

  return error;
}
