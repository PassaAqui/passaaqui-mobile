import { ImageBackground, View, Text, TextInput, Pressable, ActivityIndicator } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import UserIcon from "@/src/features/roles/user/auth/components/UserIcon";
import { login } from "@/src/features/roles/user/auth/services/authService";

export default function UserLoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState({
    email: "",
    password: "",
    general: ""
  });

  const handleSubmit = async () => {
    const errors = { email: "", password: "", general: ""}

    if (email.trim() === "") {
      errors.email = "Preencha o campo com seu email";
    }
    if (password.trim() === "") {
      errors.password = "Preencha o campo com sua senha";
    }

    setError(errors)
    const hasError = Object.values(errors).some(Boolean);
    if (hasError) return;

    setLoading(true);

    try {
      await login({ email, password });
      router.replace("/user/(private)/map/(tabs)");
    } catch {
      setError(prev => ({ ...prev, general: "Email ou senha incorretos" }));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ImageBackground
      source={{ uri: "https://www.voelivre.com.br/wp-content/uploads/2025/03/adobestock_515087389Reduzi.jpg" }}
      className="flex-1"
      resizeMode="cover"
    >
      <View className="bg-black/40 inset-0 absolute"/>

      <KeyboardAwareScrollView bottomOffset={16} contentContainerStyle={{ paddingBottom: insets.bottom }}>
        <View className="min-h-screen justify-center items-center p-9 w-full">
          <View className="flex-col justify-center items-center mb-12 gap-3">
            <UserIcon />
            <Text className="text-white text-3xl font-irishGrover text-center" adjustsFontSizeToFit numberOfLines={1}>Entrar na sua conta</Text>
          </View>

          <View className="w-full gap-3">
            <Text className="text-white font-itim">Email</Text>
            <TextInput
              keyboardType="email-address"
              value={email}
              autoCapitalize="none"
              autoCorrect={false}
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

            {error.general && <Text className="font-itim text-base text-red-300 text-center">{error.general}</Text>}

            <Pressable onPress={handleSubmit} disabled={loading} className="bg-[#EAAA6a] p-4 mt-4 items-center justify-center rounded-xl active:opacity-70">
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text className="font-itim text-lg">Entrar</Text>
              }
            </Pressable>

            <Text className="text-white font-itim text-lg text-center">Não possui uma conta? <Link href={"/user/(public)/auth/user-signup"} className="text-cyan-500">Cadastre-se</Link></Text>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </ImageBackground>
  )
}