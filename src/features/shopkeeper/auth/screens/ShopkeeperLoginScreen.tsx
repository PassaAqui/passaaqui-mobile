import { ImageBackground, View, Text, TextInput, Pressable, ActivityIndicator } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import ShopkeeperIcon from "@/src/features/shopkeeper/auth/components/ShopkeeperIcon";
import { loginShopkeeper } from "@/src/features/shopkeeper/auth/services/shopkeeperAuthService";

export default function ShopkeeperLoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [, setGeneralError] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState({
    email: "",
    password: ""
  })

  const handleSubmit = async () => {
    const errors = { email: "", password: "" };
    if (email.trim() === "") errors.email = "Preencha o campo com seu email";
    if (password.trim() === "") errors.password = "Preencha o campo com sua senha";

    setError(errors);
    if (Object.values(errors).some(Boolean)) return;

    setLoading(true);
    setGeneralError("");
    try {
      await loginShopkeeper({ email, password });
      router.replace("/shopkeeper/(private)/(tabs)");
    } catch {
      setGeneralError("Email ou senha incorretos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={{ uri: "https://www.voelivre.com.br/wp-content/uploads/2025/03/adobestock_515087389Reduzi.jpg" }}
      className="flex-1"
      resizeMode="cover"
    >
      <View className="bg-black/40 inset-0 absolute"/>
        <KeyboardAwareScrollView bottomOffset={16} contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
          <View className="min-h-screen justify-center items-center p-9 w-full">
            <View className="flex-col justify-center items-center mb-12 gap-3">
              <ShopkeeperIcon />
              <Text className="text-white text-3xl font-irishGrover text-center">Entrar na conta do seu estabelecimento</Text>
            </View>

            <View className="w-full gap-3">
              <Text className="text-white font-itim">Email</Text>
              <TextInput
                keyboardType="email-address"
                autoCapitalize="none"
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
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text className="font-itim text-lg">Entrar</Text>
                }
              </Pressable>

              <Text className="text-white font-itim text-base text-center">Estabelecimento não está cadastrado? <Link href={"/shopkeeper/(public)/auth/shopkeeper-signup"} className="text-cyan-500">Cadastre-se</Link></Text>
            </View>
          </View>
        </KeyboardAwareScrollView>
    </ImageBackground>
  )
}