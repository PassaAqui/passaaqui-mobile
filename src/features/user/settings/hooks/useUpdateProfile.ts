import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTouristProfile } from "@/src/features/user/settings/services/profileService";
import type { UpdateProfilePayload } from "@/src/features/user/settings/types/profile";

interface UpdateProfileInput {
  payload: UpdateProfilePayload;
  imageUri?: string | null;
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payload, imageUri }: UpdateProfileInput) =>
      updateTouristProfile(payload, imageUri),
    onSuccess: (data) => {
      queryClient.setQueryData(["tourist-me"], data);
    },
  });
}
