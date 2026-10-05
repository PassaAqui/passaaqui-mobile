import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { editProfileSchema, EditProfileFormErrors } from "@/src/features/user/settings/schemas/editProfileSchema";
import { useTouristMe } from "@/src/features/user/auth/hooks/useTouristMe";
import { useProfileImagePicker } from "@/src/features/user/settings/hooks/useProfileImagePicker";
import { useUpdateProfile } from "@/src/features/user/settings/hooks/useUpdateProfile";
import { getTouristAvatarUrl } from "@/src/features/user/settings/utils/touristAvatar";

export function useEditProfileForm() {
  const router = useRouter();
  const { data: tourist, isLoading: isLoadingTourist } = useTouristMe();
  const { image: selectedImage, pickImage, setImage } = useProfileImagePicker();
  const updateProfileMutation = useUpdateProfile();

  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [hasEditedName, setHasEditedName] = useState(false);

  useEffect(() => {
    if (!hasEditedName && tourist?.name) {
      setName(tourist.name);
    }
  }, [tourist?.name, hasEditedName]);

  const handleNameChange = (text: string) => {
    setHasEditedName(true);
    setName(text);
    if (nameError) setNameError("");
  };

  const validate = () => {
    const result = editProfileSchema.safeParse({ name });

    if (result.success) {
      setNameError("");
      return true;
    }

    const fieldErrors: EditProfileFormErrors = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof EditProfileFormErrors;
      if (!fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }

    setNameError(fieldErrors.name ?? "");
    return false;
  };

  const getImageUri = () => selectedImage ?? getTouristAvatarUrl(tourist);

  const handleSave = () => {
    if (!validate()) return;

    const trimmedName = name.trim();
    const nameChanged = trimmedName !== (tourist?.name?.trim() ?? "");
    const imageUri = selectedImage;
    const imageChanged = !!imageUri;

    if (!nameChanged && !imageChanged) {
      router.back();
      return;
    }

    updateProfileMutation.mutate(
      {
        payload: nameChanged ? { name: trimmedName } : {},
        imageUri: imageChanged ? imageUri : undefined,
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
    name,
    nameError,
    image: getImageUri(),
    selectedImage,
    isLoadingTourist,
    isSaving: updateProfileMutation.isPending,
    handleNameChange,
    pickImage,
    setImage,
    handleSave,
  };
}
