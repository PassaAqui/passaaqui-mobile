import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProduct, uploadProductImage, deleteProductImage, UpdateProductPayload } from "@/src/features/shopkeeper/products/services/productService";
import { SelectedImage } from "@/src/features/shopkeeper/products/hooks/useCreateProductForm";

interface UpdateProductInput {
  id: number;
  payload: UpdateProductPayload;
  newImages: SelectedImage[];
  removedImageIndexes: number[];
}

async function updateProductWithImages({ id, payload, newImages, removedImageIndexes }: UpdateProductInput) {
  const sortedRemovals = [...removedImageIndexes].sort((a, b) => b - a);
  for (const index of sortedRemovals) {
    await deleteProductImage(id, index);
  }

  const product = await updateProduct(id, payload);

  if (newImages.length === 0) return product;

  const results = await Promise.allSettled(
    newImages.map((img) => uploadProductImage(id, img.uri, img.name))
  );

  const lastFulfilled = [...results].reverse().find(
    (r): r is PromiseFulfilledResult<typeof product> => r.status === "fulfilled"
  );

  return lastFulfilled?.value ?? product;
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProductWithImages,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["shopkeeper-products"] });
      queryClient.invalidateQueries({ queryKey: ["shopkeeper-product-metrics"] });
      queryClient.invalidateQueries({ queryKey: ["product", variables.id] });
    },
  });
}