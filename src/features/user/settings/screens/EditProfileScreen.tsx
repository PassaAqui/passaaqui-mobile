import { ScrollView, View, Text, TextInput, Pressable, Image, ActivityIndicator } from "react-native";
import SettingsHeader from "@/src/features/user/settings/components/SettingsHeader";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar";
import { Ionicons } from "@expo/vector-icons";
import { useEditProfileForm } from "@/src/features/user/settings/hooks/useEditProfileForm";

export default function EditProfileScreen() {
  const {
    name,
    nameError,
    image,
    isSaving,
    handleNameChange,
    pickImage,
    handleSave,
  } = useEditProfileForm();

  useEffect(() => {
    NavigationBar.setButtonStyleAsync("dark");
  });

  return (
    <ScrollView>
      <StatusBar style="dark" />
      <View className="flex-1 items-center h-screen p-10 pt-32 bg-[#F0F0F0]">

        <SettingsHeader title="Editar perfil" />

        <View className="items-center justify-center mb-14 gap-4">
          <Pressable
            testID="edit-profile-avatar-button"
            onPress={pickImage}
            className="mb-3 active:opacity-70"
          >
            <Image
              testID="edit-profile-avatar"
              className="w-40 h-40 rounded-full"
              source={image ? { uri: image } : require("@/assets/logo/logoOFC.png")}
            />
            <View className="absolute bottom-1 right-1 bg-[#EAAA6A] w-11 h-11 rounded-full items-center justify-center border-2 border-[#F0F0F0]">
              <Ionicons name="camera" size={20} color="#fff" />
            </View>
          </Pressable>
          <Text className="font-itim text-lg opacity-65">Toque para trocar a foto</Text>
        </View>

        <View className="gap-10 w-full">
          <View className="bg-white p-5 gap-3 rounded-lg">
            <Text className="font-itim text-xl">Nome de usuário</Text>
            <TextInput
              value={name}
              onChangeText={handleNameChange}
              placeholder="Digite seu nome"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="words"
              maxLength={50}
              className="font-itim text-lg bg-[#F0F0F0] rounded-lg px-4 py-3 border border-transparent focus:border-[#EAAA6A]"
            />
            {nameError ? (
              <Text className="font-itim text-sm text-red-600">{nameError}</Text>
            ) : null}
          </View>

          <Pressable
            testID="edit-profile-save-button"
            onPress={handleSave}
            disabled={isSaving}
            className={`p-4 items-center justify-center rounded-xl flex-row gap-2 ${isSaving ? "bg-[#EAAA6A]/50" : "bg-[#EAAA6A] active:opacity-80"}`}
          >
            {isSaving ? <ActivityIndicator size="small" color="#000" testID="edit-profile-saving" /> : null}
            <Text className="font-itim text-xl text-black">Salvar alterações</Text>
          </Pressable>
        </View>

      </View>
    </ScrollView>
  );
}
