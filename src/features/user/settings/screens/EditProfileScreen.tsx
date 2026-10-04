import { ScrollView, View, Text, TextInput, Pressable, Image, Alert } from "react-native";
import SettingsHeader from "@/src/features/user/settings/components/SettingsHeader";
import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function EditProfileScreen() {
  const router = useRouter();

  const [name, setName] = useState("Nome do usuário");
  const [image, setImage] = useState<string | null>(null);
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    NavigationBar.setButtonStyleAsync("dark");
  });

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permissão necessária", "Permita o acesso à galeria para trocar a foto.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    if (name.trim().length < 3) {
      setNameError("O nome deve ter pelo menos 3 caracteres.");
      return;
    }

    // TODO: chamar o service de atualização de perfil (name + image)
    router.back();
  };

  return (
    <ScrollView>
      <StatusBar style="dark" />
      <View className="flex-1 items-center h-screen p-10 pt-32 bg-[#F0F0F0]">

        <SettingsHeader title="Editar perfil" />

        <View className="items-center justify-center mb-14 gap-4">
          <Pressable onPress={pickImage} className="mb-3 active:opacity-70">
            <Image
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
              onChangeText={(text) => {
                setName(text);
                if (nameError) setNameError("");
              }}
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
            onPress={handleSave}
            className="bg-[#EAAA6A] p-4 items-center justify-center rounded-xl active:opacity-80 flex-row gap-2"
          >
            <Text className="font-itim text-xl text-black">Salvar alterações</Text>
          </Pressable>
        </View>

      </View>
    </ScrollView>
  );
}