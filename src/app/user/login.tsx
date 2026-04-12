import { ImageBackground, ScrollView, View, Text, TextInput, Pressable, KeyboardAvoidingView } from "react-native";
import { Link } from "expo-router";
import { useState } from "react";
import UserIcon from "@/src/components/user/UserIcon";

export default function Login() {
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [error, setError] = useState({
  email: "",
  password: ""
});

const handleSubmit = () => {
  const errors = {
      email: "",
      password: ""
  }

  if (email.trim() === "") {
      errors.email = "Preencha o campo com seu email";
  }
  if (password.trim() === "") {
      errors.password = "Preencha o campo com sua senha";
  }

  setError(errors)

  const hasError = Object.values(errors).some(Boolean);
  if (hasError) return;
}

  return (
    <ImageBackground
      source={{ uri: "https://www.voelivre.com.br/wp-content/uploads/2025/03/adobestock_515087389Reduzi.jpg" }}
      className="flex-1"
      resizeMode="cover"
    >
      <View className="bg-black/40 inset-0 absolute"/>

      <KeyboardAvoidingView
        behavior="padding"
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 justify-center items-center p-9 w-full">
            <View className="flex-col justify-center items-center mb-12 gap-3">
              <UserIcon />
              <Text className="text-white text-3xl font-irishGrover text-center" adjustsFontSizeToFit numberOfLines={1}>Entrar na sua conta</Text>
            </View>

            <View className="w-full gap-3">
              <Text className="text-white font-itim">Email</Text>
              <TextInput
                keyboardType="email-address"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (error.email) {
                      setError(prev => ({ ...prev, email: "" }));
                  }
                }}
                placeholder="Digite seu email"
                className="bg-white rounded-lg p-4"
              />
              {error.email && (
                <Text className="font-itim text-base text-red-300">{error.email}</Text>
              )}
                    
              <Text className="text-white font-itim">Senha</Text>
              <TextInput
                secureTextEntry
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (error.password) {
                    setError(prev => ({ ...prev, password: "" }));
                  }
                }}
                placeholder="Digite sua senha"
                className="bg-white rounded-lg p-4"
              />
              {error.password && (
                <Text className="font-itim text-base text-red-300">{error.password}</Text>
              )}

              <Pressable onPress={handleSubmit} className="bg-[#EAAA6a] p-4 mt-4 items-center justify-center rounded-xl active:opacity-70">
                <Text className="font-itim">Entrar</Text>
              </Pressable>

              <Text className="text-white font-itim text-lg text-center">Não possui uma conta? <Link href={"/user/signup"} className="text-cyan-500">Cadastre-se</Link></Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  )
}