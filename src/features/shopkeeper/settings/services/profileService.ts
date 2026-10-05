import { api } from "@/src/services/api/api";
import type { ShopkeeperMe } from "@/src/features/shopkeeper/auth/services/shopkeeperService";
import type { UpdateShopkeeperProfilePayload } from "@/src/features/shopkeeper/settings/types/profile";

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

export async function updateShopkeeperProfile(
  payload: UpdateShopkeeperProfilePayload,
  poiImageUri?: string | null
): Promise<ShopkeeperMe> {
  const formData = new FormData();

  formData.append("data", {
    uri: `data:application/json;base64,${btoa(JSON.stringify(payload))}`,
    name: "data",
    type: "application/json",
  } as any);

  if (poiImageUri) {
    const filename = poiImageUri.split("/").pop() ?? "poi.jpg";
    formData.append("poiImage", {
      uri: poiImageUri,
      name: filename,
      type: getImageMimeType(filename),
    } as any);
  }

  const { data } = await api.put<ShopkeeperMe>("/shopkeepers/me", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
}
