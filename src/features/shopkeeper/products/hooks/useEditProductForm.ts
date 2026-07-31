import { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { editProductSchema, EditProductFormErrors } from "@/src/features/shopkeeper/products/schemas/editProductSchema";
import { CategoryData } from "@/src/features/shopkeeper/components/CategoryModal";
import { useProductById } from "@/src/features/shopkeeper/products/hooks/useProductById";
import { useUpdateProduct } from "@/src/features/shopkeeper/products/hooks/useUpdateProduct";
import { SelectedImage } from "@/src/features/shopkeeper/products/hooks/useCreateProductForm";

const DESCRIPTION_MAX_LENGTH = 700;
const MAX_IMAGES = 4;

const parseCurrency = (value: string) => parseFloat(value.replace(",", ".")) || 0;

export function useEditProductForm(productId: number) {
  const { data: product, isLoading: isLoadingProduct, isError: isProductError } = useProductById(productId);
  const updateProductMutation = useUpdateProduct();

  const [name, setName] = useState("");
  const [category, setCategory] = useState<CategoryData | null>(null);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [active, setActive] = useState(true);
  const [highlight, setHighlight] = useState(false);

  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [removedImageIndexes, setRemovedImageIndexes] = useState<number[]>([]);
  const [newImages, setNewImages] = useState<SelectedImage[]>([]);

  const [errors, setErrors] = useState<EditProductFormErrors>({});

  useEffect(() => {
    if (!product) return;
    setName(product.name);
    setCategory(product.category);
    setDescription(product.description ?? "");
    setPrice(product.price.toFixed(2).replace(".", ","));
    setQuantity(product.stock);
    setActive(product.active);
    setHighlight(product.highlight);
    setExistingImages(product.images ?? []);
  }, [product]);

  const parsedPrice = parseCurrency(price);
  const remainingExistingImages = existingImages.filter((_, i) => !removedImageIndexes.includes(i));
  const totalImagesCount = remainingExistingImages.length + newImages.length;

  const clearError = (field: keyof EditProductFormErrors) => {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleNameChange = (text: string) => {
    setName(text);
    if (text.trim()) clearError("name");
  };

  const handleDescriptionChange = (text: string) => {
    setDescription(text.slice(0, DESCRIPTION_MAX_LENGTH));
  };

  const handlePriceChange = (text: string) => {
    setPrice(text);
    if (parseCurrency(text) > 0) clearError("price");
  };

  const handleSelectCategory = (value: CategoryData) => {
    setCategory(value);
    clearError("category");
  };

  const incrementQuantity = () => {
    setQuantity((q) => q + 1);
    clearError("quantity");
  };

  const decrementQuantity = () => {
    setQuantity((q) => Math.max(q - 1, 0));
  };

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Precisamos de acesso à sua galeria para selecionar fotos.");
      return;
    }

    const remainingSlots = MAX_IMAGES - totalImagesCount;
    if (remainingSlots <= 0) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: remainingSlots,
    });

    if (result.canceled) return;

    const picked: SelectedImage[] = result.assets.map((asset) => ({
      uri: asset.uri,
      name: asset.fileName ?? asset.uri.split("/").pop() ?? "foto.jpg",
    }));

    setNewImages((prev) => [...prev, ...picked].slice(0, MAX_IMAGES - remainingExistingImages.length));
  };

  const removeExistingImage = (index: number) => {
    setRemovedImageIndexes((prev) => [...prev, index]);
  };

  const removeNewImage = (uri: string) => {
    setNewImages((prev) => prev.filter((img) => img.uri !== uri));
  };

  const validate = () => {
    const result = editProductSchema.safeParse({ name, category, description, price: parsedPrice, quantity });

    if (result.success) {
      setErrors({});
      return true;
    }

    const fieldErrors: EditProductFormErrors = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof EditProductFormErrors;
      if (!fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    setErrors(fieldErrors);
    return false;
  };

  const handleSave = (onSuccess?: () => void) => {
    if (!validate()) return;
    if (!category) return;

    updateProductMutation.mutate(
      {
        id: productId,
        payload: {
          name,
          description: description || undefined,
          price: parsedPrice,
          stock: quantity,
          active,
          highlight,
          categoryId: category.id,
        },
        newImages,
        removedImageIndexes,
      },
      { onSuccess: () => onSuccess?.() }
    );
  };

  return {
    isLoadingProduct,
    isProductError,
    name,
    category,
    categoryModalVisible,
    description,
    price,
    quantity,
    active,
    highlight,
    existingImages: remainingExistingImages,
    newImages,
    errors,
    descriptionMaxLength: DESCRIPTION_MAX_LENGTH,
    maxImages: MAX_IMAGES,
    totalImagesCount,
    isSubmitting: updateProductMutation.isPending,
    submitError: updateProductMutation.isError,
    handleNameChange,
    handleSelectCategory,
    handleDescriptionChange,
    handlePriceChange,
    incrementQuantity,
    decrementQuantity,
    setActive,
    setHighlight,
    pickImages,
    removeExistingImage,
    removeNewImage,
    handleSave,
    openCategoryModal: () => setCategoryModalVisible(true),
    closeCategoryModal: () => setCategoryModalVisible(false),
  };
}