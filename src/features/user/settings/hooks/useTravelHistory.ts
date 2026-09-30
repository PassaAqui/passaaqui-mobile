import { useQuery } from "@tanstack/react-query";
import { getTravelHistory } from "@/src/features/user/settings/services/travelHistoryService";

export function useTravelHistory() {
  return useQuery({
    queryKey: ["travel-history"],
    queryFn: getTravelHistory,
    staleTime: 2 * 60 * 1000,
  });
}