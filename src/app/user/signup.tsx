import { ImageBackground, ScrollView, View, Text, TextInput, Pressable } from "react-native";
import { useState } from "react";
import { signUpSchema } from "@/src/schemas/user/signUpSchema";
import { Link } from "expo-router";
import Checkbox from "expo-checkbox";
import UserIcon from "@/src/components/user/UserIcon";

const formatCpf = (text: string) => {
  const digits = text.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChecked, setChecked] = useState(false);
  const [error, setError] = useState({
      name: "",
      email: "",
      cpf: "",
      password: "",
      confirmPassword: "",
      terms: ""
  });

  const handleSubmit = () => {
    const result = signUpSchema.safeParse({
      name,
      email,
      cpf,
      password,
      confirmPassword,
      terms: isChecked,
    });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;

      setError({
        name: fieldErrors.name?.[0] ?? "",
        email: fieldErrors.email?.[0] ?? "",
        cpf: fieldErrors.cpf?.[0] ?? "",
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
      <ScrollView>
        <View className="justify-center items-center bg-black/40 min-h-screen p-9 w-full">
          <View className="flex-col justify-center items-center gap-3">
            <UserIcon />
            <Text className="text-white text-3xl font-irishGrover text-center" adjustsFontSizeToFit numberOfLines={1}>Criar uma conta</Text>
          </View>

          <View className="w-full gap-2">
            <Text className="text-white font-itim text-lg">Nome</Text>
            <TextInput
              value={name}
              onChangeText={(text) => {
                  setName(text);
                  if (error.name) {
                      setError(prev => ({ ...prev, name: "" }));
                  }
              }}
              className="bg-white rounded-lg p-4"
              placeholder={"Digite seu nome"}
            />
            {error.name && (
              <Text className="font-itim text-base text-red-300">{error.name}</Text>
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
              placeholder={"Digite seu email aqui"}
            />
            {error.email && (
              <Text className="font-itim text-base text-red-300">{error.email}</Text>
            )}

            <Text className="text-white font-itim text-lg">CPF</Text>
            <TextInput
              keyboardType="numeric"
              value={cpf}
              onChangeText={(text) => {
                setCpf(formatCpf(text));
                if (error.cpf) setError(prev => ({ ...prev, cpf: "" }));
              }}
              className="bg-white rounded-lg p-4"
              placeholder={"___.___.___-__"}
            />
            {error.cpf && (
              <Text className="font-itim text-base text-red-300">{error.cpf}</Text>
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

            <Text className="font-itim text-lg text-white text-center">Já possui uma conta? Faça o <Link href={"/user/login"} className="text-cyan-500">Login</Link></Text>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  )
}