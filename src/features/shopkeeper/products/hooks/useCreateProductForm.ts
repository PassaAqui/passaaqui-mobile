import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { createProductSchema, CreateProductFormErrors } from "@/src/features/shopkeeper/products/schemas/createProductSchema";
import { CategoryData } from "@/src/features/shopkeeper/components/CategoryModal";
import { useCreateProduct } from "@/src/features/shopkeeper/products/hooks/useCreateProduct";
import { useShopkeeperMe } from "@/src/features/shopkeeper/auth/hooks/useShopkeeperMe";

const DESCRIPTION_MAX_LENGTH = 700;
const MAX_IMAGES = 4;

export interface SelectedImage {
  uri: string;
  name: string;
}

const parseCurrency = (value: string) => parseFloat(value.replace(",", ".")) || 0;

export function useCreateProductForm() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<CategoryData | null>(null);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [images, setImages] = useState<SelectedImage[]>([]);
  const [errors, setErrors] = useState<CreateProductFormErrors>({});

  const createProductMutation = useCreateProduct();
  
  const { data: shopkeeperMe } = useShopkeeperMe();
  const shopkeeperId = shopkeeperMe?.id;
  const poiId = shopkeeperMe?.poi.id;

  const parsedPrice = parseCurrency(price);

  const clearError = (field: keyof CreateProductFormErrors) => {
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

    const remainingSlots = MAX_IMAGES - images.length;
    if (remainingSlots <= 0) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: remainingSlots,
    });

    if (result.canceled) return;

    const newImages: SelectedImage[] = result.assets.map((asset) => ({
      uri: asset.uri,
      name: asset.fileName ?? asset.uri.split("/").pop() ?? "foto.jpg",
    }));

    setImages((prev) => [...prev, ...newImages].slice(0, MAX_IMAGES));
    clearError("images");
  };

  const removeImage = (uri: string) => {
    setImages((prev) => prev.filter((img) => img.uri !== uri));
  };

  const validate = () => {
    const result = createProductSchema.safeParse({
      name,
      category,
      description,
      price: parsedPrice,
      quantity,
      images,
    });

    if (result.success) {
      setErrors({});
      return true;
    }

    const fieldErrors: CreateProductFormErrors = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof CreateProductFormErrors;
      if (!fieldErrors[field]) fieldErrors[field] = issue.message;
    }

    setErrors(fieldErrors);
    return false;
  };

  const handlePublish = (onSuccess?: () => void) => {
    if (!validate()) return;
    if (!category || !shopkeeperId || !poiId) {
      return;
    }

    createProductMutation.mutate(
      {
        payload: {
          name,
          description: description || undefined,
          price: parsedPrice,
          stock: quantity,
          active: true,
          highlight: false,
          shopkeeperId,
          categoryId: category.id,
          poiId,
        },
        images,
      },
      {
        onSuccess: () => {
          onSuccess?.();
        },
      }
    );
  };

  return {
    name,
    category,
    categoryModalVisible,
    description,
    price,
    quantity,
    images,
    errors,
    descriptionMaxLength: DESCRIPTION_MAX_LENGTH,
    maxImages: MAX_IMAGES,
    isSubmitting: createProductMutation.isPending,
    submitError: createProductMutation.isError,
    submitResult: createProductMutation.data,
    handleNameChange,
    handleSelectCategory,
    handleDescriptionChange,
    handlePriceChange,
    incrementQuantity,
    decrementQuantity,
    pickImages,
    removeImage,
    handlePublish,
    openCategoryModal: () => setCategoryModalVisible(true),
    closeCategoryModal: () => setCategoryModalVisible(false),
  }
}