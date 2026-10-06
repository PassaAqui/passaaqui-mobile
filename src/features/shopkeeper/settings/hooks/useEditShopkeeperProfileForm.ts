import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import {
  editShopkeeperProfileSchema,
  EditShopkeeperProfileFormErrors,
} from "@/src/features/shopkeeper/settings/schemas/editShopkeeperProfileSchema";
import { useShopkeeperMe } from "@/src/features/shopkeeper/auth/hooks/useShopkeeperMe";
import { useShopkeeperProfileImagePicker } from "@/src/features/shopkeeper/settings/hooks/useShopkeeperProfileImagePicker";
import { useUpdateShopkeeperProfile } from "@/src/features/shopkeeper/settings/hooks/useUpdateShopkeeperProfile";
import { getShopkeeperStoreImageUrl } from "@/src/features/shopkeeper/settings/utils/shopkeeperStoreImage";

export function useEditShopkeeperProfileForm() {
  const router = useRouter();
  const { data: shopkeeper, isLoading: isLoadingShopkeeper } = useShopkeeperMe();
  const { image: selectedImage, pickImage, setImage } = useShopkeeperProfileImagePicker();
  const updateProfileMutation = useUpdateShopkeeperProfile();

  const [companyName, setCompanyName] = useState("");
  const [companyNameError, setCompanyNameError] = useState("");
  const [hasEditedCompanyName, setHasEditedCompanyName] = useState(false);

  useEffect(() => {
    if (!hasEditedCompanyName && shopkeeper?.companyName) {
      setCompanyName(shopkeeper.companyName);
    }
  }, [shopkeeper?.companyName, hasEditedCompanyName]);

  const handleCompanyNameChange = (text: string) => {
    setHasEditedCompanyName(true);
    setCompanyName(text);
    if (companyNameError) setCompanyNameError("");
  };

  const validate = () => {
    const result = editShopkeeperProfileSchema.safeParse({ companyName });

    if (result.success) {
      setCompanyNameError("");
      return true;
    }

    const fieldErrors: EditShopkeeperProfileFormErrors = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof EditShopkeeperProfileFormErrors;
      if (!fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }

    setCompanyNameError(fieldErrors.companyName ?? "");
    return false;
  };

  const getImageUri = () => selectedImage ?? getShopkeeperStoreImageUrl(shopkeeper);

  const handleSave = () => {
    if (!validate()) return;

    const trimmedCompanyName = companyName.trim();
    const companyNameChanged =
      trimmedCompanyName !== (shopkeeper?.companyName?.trim() ?? "");
    const imageChanged = !!selectedImage;

    if (!companyNameChanged && !imageChanged) {
      router.back();
      return;
    }

    updateProfileMutation.mutate(
      {
        payload: companyNameChanged ? { companyName: trimmedCompanyName } : {},
        poiImageUri: imageChanged ? selectedImage : undefined,
      },
      {
        onSuccess: () => {
          router.back();
        },
        onError: () => {
          Alert.alert(
            "Erro ao salvar",
            "Não foi possível salvar as alterações. Tente novamente."
          );
        },
      }
    );
  };

  return {
    companyName,
    companyNameError,
    image: getImageUri(),
    selectedImage,
    isLoadingShopkeeper,
    isSaving: updateProfileMutation.isPending,
    handleCompanyNameChange,
    pickImage,
    setImage,
    handleSave,
  };
}
