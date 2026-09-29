import { useQuery } from "@tanstack/react-query";
import { getAchievements } from "@/src/features/user/achievements/services/achievementService";

export function useAchievements() {
  return useQuery({
    queryKey: ["achievements"],
    queryFn: getAchievements,
    staleTime: 2 * 60 * 1000,
  });
}
