import { useQuery } from "@tanstack/react-query";
import { getTouristMe } from "@/src/features/user/auth/services/touristService";

export function useTouristMe() {
  return useQuery({
    queryKey: ["tourist-me"],
    queryFn: getTouristMe,
    staleTime: 1000 * 60 * 15 // 15 minutos
  })
}