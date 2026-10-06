import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateShopkeeperProfile } from "@/src/features/shopkeeper/settings/services/profileService";
import type { UpdateShopkeeperProfilePayload } from "@/src/features/shopkeeper/settings/types/profile";

interface UpdateShopkeeperProfileInput {
  payload: UpdateShopkeeperProfilePayload;
  poiImageUri?: string | null;
}

export function useUpdateShopkeeperProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payload, poiImageUri }: UpdateShopkeeperProfileInput) =>
      updateShopkeeperProfile(payload, poiImageUri),
    onSuccess: (data) => {
      queryClient.setQueryData(["shopkeeper-me"], data);
    },
  });
}
