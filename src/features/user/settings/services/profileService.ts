import { api } from "@/src/services/api/api";
import type {
  TouristProfileResponse,
  UpdateProfilePayload,
} from "@/src/features/user/settings/types/profile";

function getImageMimeType(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    default:
      return "image/jpeg";
  }
}

export async function updateTouristProfile(
  payload: UpdateProfilePayload,
  imageUri?: string | null
): Promise<TouristProfileResponse> {
  const formData = new FormData();

  formData.append("data", {
    uri: `data:application/json;base64,${btoa(JSON.stringify(payload))}`,
    name: "data",
    type: "application/json",
  } as any);

  if (imageUri) {
    const filename = imageUri.split("/").pop() ?? "avatar.jpg";
    formData.append("image", {
      uri: imageUri,
      name: filename,
      type: getImageMimeType(filename),
    } as any);
  }

  const { data } = await api.put<TouristProfileResponse>("/tourists/me", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
}

export async function updateTouristAvatar(
  imageUri: string
): Promise<TouristProfileResponse> {
  const formData = new FormData();
  const filename = imageUri.split("/").pop() ?? "avatar.jpg";
  formData.append("image", {
    uri: imageUri,
    name: filename,
    type: getImageMimeType(filename),
  } as any);

  const { data } = await api.patch<TouristProfileResponse>("/tourists/me/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
}
