import { useQuery } from "@tanstack/react-query";
import { getAchievementCategories } from "@/src/features/user/achievements/services/achievementService";

export function useAchievementCategories() {
  return useQuery({
    queryKey: ["achievement-categories"],
    queryFn: getAchievementCategories,
    staleTime: 24 * 60 * 60 * 1000,
  });
}
