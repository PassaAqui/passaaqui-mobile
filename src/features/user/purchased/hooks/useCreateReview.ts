import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProductReview, CreateReviewPayload } from "@/src/features/user/purchased/services/reviewService";

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateReviewPayload) => createProductReview(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["poi-products"] });
      queryClient.invalidateQueries({ queryKey: ["category-products"] });
      queryClient.invalidateQueries({ queryKey: ["purchased-products"] });
      queryClient.invalidateQueries({ queryKey: ["product-ratings"] });
    },
  });
}