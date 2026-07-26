import { useQuery } from "@tanstack/react-query";
import { getShopkeeperMe } from "@/src/features/shopkeeper/auth/services/shopkeeperService";

export function useShopkeeperMe() {
  return useQuery({
    queryKey: ["shopkeeper-me"],
    queryFn: getShopkeeperMe,
    staleTime: 1000 * 60 * 30
  });
}