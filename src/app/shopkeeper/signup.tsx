import { ImageBackground, ScrollView, View, Text, TextInput, Pressable, KeyboardAvoidingView } from "react-native";
import { useState, useEffect } from "react";
import { shopkeeperSignUpSchema } from "@/src/schemas/shopkeeper/signUpSchema";
import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar"
import Checkbox from "expo-checkbox";
import ShopkeeperIcon from "@/src/components/shopkeeper/ShopkeeperIcon";

const formatCpfOrCnpj = (text: string) => {
  const digits = text.replace(/\D/g, "").slice(0, 14);

  if (digits.length <= 11) {
    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }

  return digits
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1/$2");
};

export default function SignUp() {
  const [storeName, setStoreName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [cpfOrCnpj, setCpfOrCnpj] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChecked, setChecked] = useState(false);
  const [error, setError] = useState({
      storeName: "",
      ownerName: "",
      email: "",
      cpfOrCnpj: "",
      password: "",
      confirmPassword: "",
      terms: ""
  });

  useEffect(() => {
    NavigationBar.setVisibilityAsync("hidden");
  }, []);

  const handleSubmit = () => {
    const result = shopkeeperSignUpSchema.safeParse({
      storeName,
      ownerName,
      email,
      cpfOrCnpj,
      password,
      confirmPassword,
      terms: isChecked,
    });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;

      setError({
        storeName: fieldErrors.storeName?.[0] ?? "",
        ownerName: fieldErrors.ownerName?.[0] ?? "",
        email: fieldErrors.email?.[0] ?? "",
        cpfOrCnpj: fieldErrors.cpfOrCnpj?.[0] ?? "",
        password: fieldErrors.password?.[0] ?? "",
        confirmPassword: fieldErrors.confirmPassword?.[0] ?? "",
        terms: fieldErrors.terms?.[0] ?? "",
      });

      return;
    }

    console.log(result.data);
  }

  return (
    <ImageBackground
      source={{ uri: "https://www.voelivre.com.br/wp-content/uploads/2025/03/adobestock_515087389Reduzi.jpg" }}
      className="flex-1"
      resizeMode="cover"
    >
      <StatusBar hidden />
      <View className="bg-black/40 inset-0 absolute" />

      <KeyboardAvoidingView
        behavior="padding"
        className="flex-1"
      >
        <ScrollView>
          <View className="justify-center items-center min-h-screen p-9 w-full">
            <View className="flex-col justify-center items-center gap-3">
              <ShopkeeperIcon />
              <Text className="text-white text-3xl font-irishGrover text-center" adjustsFontSizeToFit numberOfLines={1}>Criar uma conta</Text>
            </View>

            <View className="w-full gap-2">
              <Text className="text-white font-itim text-lg">Nome do estabelecimento</Text>
                <TextInput
                value={storeName}
                onChangeText={(text) => {
                    setStoreName(text);
                    if (error.storeName) {
                        setError(prev => ({ ...prev, storeName: "" }));
                    }
                }}
                className="bg-white rounded-lg p-4"
                placeholder={"Digite o nome do estabelecimento"}
              />
              {error.storeName && (
                <Text className="font-itim text-base text-red-300">{error.storeName}</Text>
              )}

              <Text className="text-white font-itim text-lg">Nome do proprietário</Text>
              <TextInput
                value={ownerName}
                onChangeText={(text) => {
                    setOwnerName(text);
                    if (error.ownerName) {
                        setError(prev => ({ ...prev, ownerName: "" }));
                    }
                }}
                className="bg-white rounded-lg p-4"
                placeholder={"Digite o nome do proprietário"}
              />
              {error.ownerName && (
                <Text className="font-itim text-base text-red-300">{error.ownerName}</Text>
              )}

              <Text className="text-white font-itim text-lg">Email</Text>
              <TextInput
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={(text) => {
                    setEmail(text);
                    if (error.email) {
                        setError(prev => ({ ...prev, email: "" }));
                    }
                }}
                className="bg-white rounded-lg p-4"
                placeholder={"Digite o email do estabelecimento"}
              />
              {error.email && (
                <Text className="font-itim text-base text-red-300">{error.email}</Text>
              )}

              <Text className="text-white font-itim text-lg">CNPJ ou CPF</Text>
              <TextInput
                keyboardType="numeric"
                value={cpfOrCnpj}
                onChangeText={(text) => {
                  setCpfOrCnpj(formatCpfOrCnpj(text));
                  if (error.cpfOrCnpj) setError(prev => ({ ...prev, cpfOrCnpj: "" }));
                }}
                className="bg-white rounded-lg p-4"
                placeholder={"__.___.___/____-__ ou ___.___.___-__"}
              />
              {error.cpfOrCnpj && (
                <Text className="font-itim text-base text-red-300">{error.cpfOrCnpj}</Text>
              )}

              <Text className="text-white font-itim text-lg">Senha</Text>
              <TextInput
                secureTextEntry
                value={password}
                onChangeText={(text) => {
                    setPassword(text);
                    if (error.password) {
                        setError(prev => ({ ...prev, password: "" }));
                    }
                }}
                className="bg-white rounded-lg p-4"
                placeholder={"Digite sua senha"}
              />
              {error.password && (
                <Text className="font-itim text-base text-red-300">{error.password}</Text>
              )}

              <Text className="text-white font-itim text-lg">Confirmar senha</Text>
              <TextInput
                secureTextEntry
                value={confirmPassword}
                onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (error.confirmPassword) {
                        setError(prev => ({ ...prev, confirmPassword: "" }));
                    }
                }}
                className="bg-white rounded-lg p-4"
                placeholder={"Confirme sua senha"}
              />
              {error.confirmPassword && (
                <Text className="font-itim text-base text-red-300">{error.confirmPassword}</Text>
              )}

              <View className="flex-row items-center gap-2">
                <Checkbox
                        value={isChecked}
                        onValueChange={(state) => {
                            setChecked(state);
                            if (error.terms) {
                                setError(prev => ({ ...prev, terms: "" }))
                            }
                        }}
                        color={isChecked? "#2463EB" : undefined}
                        className="border-red-500"
                    />
                    <Text className={`text-sm font-roboto ${error.terms ? "text-red-300" : "text-white"}`}>Li e aceito os <Text className="text-cyan-500 font-itim">Termos de Uso</Text> e a <Text className="text-cyan-500 font-itim">Política de Privacidade</Text>.</Text>
              </View>

              <Pressable onPress={handleSubmit} className="bg-[#EAAA6a] p-4 items-center justify-center rounded-xl active:opacity-70">
                <Text>Cadastrar</Text>
              </Pressable>

              <Text className="font-itim text-lg text-white text-center">Já possui uma conta? Faça o <Link href={"/shopkeeper/login"} className="text-cyan-500">Login</Link></Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  )
}