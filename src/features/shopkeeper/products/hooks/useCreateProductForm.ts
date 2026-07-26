import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { createProductSchema, CreateProductFormErrors } from "@/src/features/shopkeeper/products/schemas/createProductSchema";
import { CategoryData } from "@/src/features/shopkeeper/components/CategoryModal";

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
  const [originalPrice, setOriginalPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [xpCost, setXpCost] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [images, setImages] = useState<SelectedImage[]>([]);
  const [errors, setErrors] = useState<CreateProductFormErrors>({});

  const parsedPrice = parseCurrency(originalPrice);
  const parsedDiscount = parseCurrency(discount);
  const finalPrice = Math.max(parsedPrice - parsedDiscount, 0);

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

  const handleOriginalPriceChange = (text: string) => {
    setOriginalPrice(text);
    if (parseCurrency(text) > 0) clearError("originalPrice");
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
    setQuantity((q) => {
      const next = Math.max(q - 1, 0);
      return next;
    });
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
      category: category?.name ?? "",
      description,
      originalPrice: parsedPrice,
      discount: parsedDiscount,
      xpCost: parseFloat(xpCost) || 0,
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

  const handlePublish = () => {
    if (!validate()) return;
    // enviar produto pra API (usar category?.id como categoryId)
  };

  return {
    name,
    category,
    categoryModalVisible,
    description,
    originalPrice,
    discount,
    xpCost,
    quantity,
    images,
    errors,
    finalPrice,
    descriptionMaxLength: DESCRIPTION_MAX_LENGTH,
    maxImages: MAX_IMAGES,
    handleNameChange,
    handleSelectCategory,
    handleDescriptionChange,
    handleOriginalPriceChange,
    setDiscount,
    setXpCost,
    incrementQuantity,
    decrementQuantity,
    pickImages,
    removeImage,
    handlePublish,
    openCategoryModal: () => setCategoryModalVisible(true),
    closeCategoryModal: () => setCategoryModalVisible(false),
  };
}