import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProduct, uploadProductImage, CreateProductPayload, ProductModel } from "@/src/features/shopkeeper/products/services/productService";
import { SelectedImage } from "@/src/features/shopkeeper/products/hooks/useCreateProductForm";

interface CreateProductWithImagesInput {
  payload: CreateProductPayload;
  images: SelectedImage[];
}

export interface CreateProductResult {
  product: ProductModel;
  totalImages: number;
  uploadedImages: number;
  failedImages: number;
}

async function createProductWithImages({ payload, images }: CreateProductWithImagesInput): Promise<CreateProductResult> {
  const product = await createProduct(payload);

  if (images.length === 0) {
    return { product, totalImages: 0, uploadedImages: 0, failedImages: 0 };
  }

  const results = await Promise.allSettled(
    images.map((image) => uploadProductImage(product.id, image.uri, image.name))
  );

  const uploadedImages = results.filter((r) => r.status === "fulfilled").length;
  const failedImages = results.length - uploadedImages;

  /*
   Se algum upload deu certo, usa o produto retornado da última chamada bem-sucedida
   (contém o array de images mais atualizado); senão, mantem o produto original
  */
  const lastFulfilled = [...results].reverse().find(
    (r): r is PromiseFulfilledResult<ProductModel> => r.status === "fulfilled"
  );

  return {
    product: lastFulfilled?.value ?? product,
    totalImages: images.length,
    uploadedImages,
    failedImages,
  };
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProductWithImages,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopkeeper-products"] });
      queryClient.invalidateQueries({ queryKey: ["shopkeeper-product-metrics"] });
    },
  });
}