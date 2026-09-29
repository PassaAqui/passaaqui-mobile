import type {
  Achievement,
  AchievementRaw,
} from "@/src/features/user/achievements/services/achievementService";

export const unlockedAchievementRaw: AchievementRaw = {
  achievement_id: 1,
  name: "Rio Timbó",
  description:
    "Uma iguaria digna da realeza, feita com a goma mais pura de Pernambuco e recheio de tradição.",
  photo_url: "http://localhost:9000/test-bucket/achievements/rio-timbo.jpg",
  xp_reward: 100,
  category_id: 2,
  category_name: "Cultura",
  location: "Mercado São José",
  poi_id: 5,
  poi_name: "Mercado São José",
  unlocked: true,
  unlocked_at: "2026-01-01T10:00:00",
};

export const unlockedAchievement: Achievement = {
  achievementId: 1,
  name: "Rio Timbó",
  description:
    "Uma iguaria digna da realeza, feita com a goma mais pura de Pernambuco e recheio de tradição.",
  photoUrl: "http://localhost:9000/test-bucket/achievements/rio-timbo.jpg",
  xpReward: 100,
  categoryId: 2,
  categoryName: "Cultura",
  location: "Mercado São José",
  poiId: 5,
  poiName: "Mercado São José",
  unlocked: true,
  unlockedAt: "2026-01-01T10:00:00",
};

export const lockedAchievementRaw: AchievementRaw = {
  achievement_id: 2,
  name: "Tapioca real",
  description: "Colete para colar",
  photo_url: "http://localhost:9000/test-bucket/achievements/tapioca.jpg",
  xp_reward: 50,
  category_id: 1,
  category_name: "Gastronomia",
  location: null,
  poi_id: null,
  poi_name: null,
  unlocked: false,
  unlocked_at: null,
};

export const lockedAchievement: Achievement = {
  achievementId: 2,
  name: "Tapioca real",
  description: "Colete para colar",
  photoUrl: "http://localhost:9000/test-bucket/achievements/tapioca.jpg",
  xpReward: 50,
  categoryId: 1,
  categoryName: "Gastronomia",
  location: null,
  poiId: null,
  poiName: null,
  unlocked: false,
  unlockedAt: null,
};

export const achievementsRaw: AchievementRaw[] = [unlockedAchievementRaw, lockedAchievementRaw];

export const achievements: Achievement[] = [unlockedAchievement, lockedAchievement];

export const emptyAchievements: Achievement[] = [];

export function createAxiosError(status: number) {
  const error = new Error("Request failed") as Error & {
    isAxiosError: boolean;
    response: { status: number; data: unknown };
  };

  error.isAxiosError = true;
  error.response = { status, data: {} };

  return error;
}
