import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getAchievements } from "@/src/features/user/achievements/services/achievementService";

export function useAchievements(category?: string) {
  return useQuery({
    queryKey: ["achievements", category ?? null],
    queryFn: () => getAchievements(category),
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000,
  });
}
