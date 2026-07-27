import { useQuery } from "@tanstack/react-query";
import { getDashboard } from "@/src/features/shopkeeper/dashboard/services/dashboardService";

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboard,
  });
}