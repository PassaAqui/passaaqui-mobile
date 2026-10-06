import type { TouristProfile } from "@/src/features/user/auth/services/touristService";

export function getTouristAvatarUrl(
  profile?: Pick<TouristProfile, "image" | "imageUrl"> | null
): string | null {
  return profile?.imageUrl ?? profile?.image ?? null;
}
