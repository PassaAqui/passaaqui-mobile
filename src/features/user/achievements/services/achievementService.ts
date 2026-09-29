import { api } from "@/src/services/api/api";

export interface AchievementRaw {
  achievement_id: number;
  name: string;
  description: string;
  photo_url: string | null;
  xp_reward: number;
  category_id: number;
  category_name: string;
  location: string | null;
  poi_id: number | null;
  poi_name: string | null;
  unlocked: boolean;
  unlocked_at: string | null;
}

export interface Achievement {
  achievementId: number;
  name: string;
  description: string;
  photoUrl: string | null;
  xpReward: number;
  categoryId: number;
  categoryName: string;
  location: string | null;
  poiId: number | null;
  poiName: string | null;
  unlocked: boolean;
  unlockedAt: string | null;
}

function normalizeAchievement(raw: AchievementRaw): Achievement {
  return {
    achievementId: raw.achievement_id,
    name: raw.name,
    description: raw.description,
    photoUrl: raw.photo_url ?? null,
    xpReward: raw.xp_reward,
    categoryId: raw.category_id,
    categoryName: raw.category_name,
    location: raw.location ?? null,
    poiId: raw.poi_id ?? null,
    poiName: raw.poi_name ?? null,
    unlocked: raw.unlocked,
    unlockedAt: raw.unlocked_at ?? null,
  };
}

export async function getAchievements(): Promise<Achievement[]> {
  const { data } = await api.get<AchievementRaw[]>("/achievements");

  return data.map(normalizeAchievement);
}
