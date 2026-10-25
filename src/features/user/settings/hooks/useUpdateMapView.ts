import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateMapView, type MapView } from "@/src/features/user/auth/services/touristService";

export function useUpdateMapView() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (mapView: MapView) => updateMapView(mapView),
    onSuccess: (user) => {
      queryClient.setQueryData(["tourist-me"], user);
    },
  });
}
