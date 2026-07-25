import { useQuery } from "@tanstack/react-query";
import { getPoiById } from "@/src/features/roles/user/map/poi/services/poiService";

export function useProductsByPoi(poiId: number | undefined) {
  return useQuery({
    queryKey: ["poi-products", poiId],
    queryFn: () => getPoiById(poiId!),
    enabled: !!poiId,
    staleTime: 2 * 60 * 1000 // 2 minutos
  });
}