import { ImageBackground, View, Text, TextInput, Pressable, Image, ActivityIndicator } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { shopkeeperSignUpSchema } from "@/src/features/shopkeeper/auth/schemas/signUpSchema";
import { Link } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Checkbox from "expo-checkbox";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import ShopkeeperIcon from "@/src/features/shopkeeper/auth/components/ShopkeeperIcon";
import { CategoryModal, CategoryData } from "@/src/features/shopkeeper/components/CategoryModal";
import StoreLocationPickerModal, { ExistingPoi } from "@/src/features/shopkeeper/auth/components/StoreLocationPickerModal";
import { signUpShopkeeper, loginShopkeeper } from "@/src/features/shopkeeper/auth/services/shopkeeperAuthService";
import { useRouter } from "expo-router";

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

const EXISTING_POIS: ExistingPoi[] = [
  { id: 1, name: "Loja Exemplo", latitude: -8.0675, longitude: -34.9167 },
];

const FIXED_CITY_ID = 1;
const FIXED_CITY_LABEL = "Recife";

function FieldError({ children }: { children?: string }) {
  if (!children) return null;
  return <Text className="font-itim text-sm text-red-300 mt-1">{children}</Text>;
}

function InputWithIcon({ icon, ...props }: React.ComponentProps<typeof TextInput> & { icon: keyof typeof Ionicons.glyphMap }) {
  return (
    <View className="flex-row items-center bg-white rounded-xl px-4 border border-transparent focus:border-[#EAAA6A]">
      <Ionicons name={icon} size={18} color="#9CA3AF" />
      <TextInput
        {...props}
        placeholderTextColor="#9CA3AF"
        className="flex-1 py-4 px-3 text-black"
      />
    </View>
  );
}

export default function ShopkeeperSignupScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter()

  const [companyName, setCompanyName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [description, setDescription] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [street, setStreet] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [category, setCategory] = useState<CategoryData | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isChecked, setChecked] = useState(false);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  const [generalError, setGeneralError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const [error, setError] = useState({
    companyName: "",
    ownerName: "",
    email: "",
    documentId: "",
    password: "",
    confirmPassword: "",
    category: "",
    neighborhood: "",
    street: "",
    description: "",
    image: "",
    location: "",
    terms: "",
  });

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      if (error.image) setError((prev) => ({ ...prev, image: "" }));
    }
  }

  const handleSubmit = async () => {
    const result = shopkeeperSignUpSchema.safeParse({
      companyName,
      ownerName,
      email,
      documentId,
      password,
      confirmPassword,
      category: category?.name ?? "",
      cityId: FIXED_CITY_ID,
      neighborhood,
      street,
      description,
      poiDescription: description,
      image: image ?? "",
      location: location ?? undefined,
      terms: isChecked,
    });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;

      setError({
        companyName: fieldErrors.companyName?.[0] ?? "",
        ownerName: fieldErrors.ownerName?.[0] ?? "",
        email: fieldErrors.email?.[0] ?? "",
        documentId: fieldErrors.documentId?.[0] ?? "",
        password: fieldErrors.password?.[0] ?? "",
        confirmPassword: fieldErrors.confirmPassword?.[0] ?? "",
        category: fieldErrors.category?.[0] ?? "",
        neighborhood: fieldErrors.neighborhood?.[0] ?? "",
        street: fieldErrors.street?.[0] ?? "",
        description: fieldErrors.description?.[0] ?? "",
        image: fieldErrors.image?.[0] ?? "",
        location: fieldErrors.location?.[0] ?? "",
        terms: fieldErrors.terms?.[0] ?? "",
      });

      return;
    }

    console.log(result.data);
    setLoading(true);
    try {
      const formData = new FormData();

      formData.append("data", {
        uri: `data:application/json;base64,${btoa(JSON.stringify({
          email: result.data.email,
          name: result.data.ownerName,
          password: result.data.password,
          confirm_password: result.data.confirmPassword,
          documentId: result.data.documentId.replace(/\D/g, ""),
          companyName: result.data.companyName,
          description: result.data.description,
          categoryId: category!.id,
          poiName: result.data.companyName,
          poiDescription: result.data.description,
          latitude: result.data.location?.latitude,
          longitude: result.data.location?.longitude,
          cityId: FIXED_CITY_ID,
        }))}`,
        name: "data",
        type: "application/json",
      } as any);

      if (image) {
        const filename = image.split("/").pop() ?? "image.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";
        formData.append("image", { uri: image, name: filename, type } as any);
      }

      await signUpShopkeeper(formData);
      await loginShopkeeper({ email: result.data.email, password: result.data.password });
      router.replace("/shopkeeper/(private)/(tabs)");
    } catch {
      setGeneralError("Erro ao criar conta. Verifique os dados.");
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
      <SafeAreaView edges={["top", "bottom"]} className="flex-1">
        <View className="bg-black/55 inset-0 absolute" />

        <KeyboardAwareScrollView bottomOffset={16} contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
          <View className="items-center px-6 pt-8 pb-10 w-full">
            <View className="flex-col justify-center items-center gap-2 mb-8">
              <ShopkeeperIcon />
              <Text className="text-white text-3xl font-interBold text-center" adjustsFontSizeToFit numberOfLines={1}>
                Criar uma conta
              </Text>
              <Text className="text-white font-inter text-sm text-center">
                Cadastre sua loja e comece a vender no app
              </Text>
            </View>

            <View className="w-full bg-white/10 border border-white/15 rounded-3xl p-5 gap-6">
              <View>
                <Pressable onPress={pickImage} className="items-center justify-center bg-white/10 border-2 border-dashed border-white/40 rounded-2xl h-36 overflow-hidden">
                  {image ? (
                    <Image source={{ uri: image }} className="w-full h-full" resizeMode="cover" />
                  ) : (
                    <View className="items-center gap-2">
                      <Ionicons name="camera-outline" size={28} color="#fff" />
                      <Text className="text-white/80 font-itim text-sm">Adicionar foto do estabelecimento</Text>
                    </View>
                  )}
                </Pressable>
                <FieldError>{error.image}</FieldError>
              </View>

              <View className="gap-3">
                <Text className="text-white font-itim text-lg border-b border-white/20 pb-1">Dados do estabelecimento</Text>
                <View>
                  <Text className="text-white/90 font-itim text-base mb-1">Nome do estabelecimento</Text>
                  <InputWithIcon
                    icon="storefront-outline"
                    value={companyName}
                    onChangeText={(text) => {
                      setCompanyName(text);
                      if (error.companyName) setError((prev) => ({ ...prev, companyName: "" }));
                    }}
                    placeholder="Digite o nome do estabelecimento"
                  />
                  <FieldError>{error.companyName}</FieldError>
                </View>

                <View>
                  <Text className="text-white/90 font-itim text-base mb-1">Nome do proprietário</Text>
                  <InputWithIcon
                    icon="person-outline"
                    value={ownerName}
                    onChangeText={(text) => {
                      setOwnerName(text);
                      if (error.ownerName) setError((prev) => ({ ...prev, ownerName: "" }));
                    }}
                    placeholder="Digite o nome do proprietário"
                  />
                  <FieldError>{error.ownerName}</FieldError>
                </View>

                <View>
                  <Text className="text-white/90 font-itim text-base mb-1">Email</Text>
                  <InputWithIcon
                    icon="mail-outline"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (error.email) setError((prev) => ({ ...prev, email: "" }));
                    }}
                    placeholder="Digite o email do estabelecimento"
                  />
                  <FieldError>{error.email}</FieldError>
                </View>

                <View>
                  <Text className="text-white/90 font-itim text-base mb-1">CNPJ ou CPF</Text>
                  <InputWithIcon
                    icon="document-text-outline"
                    keyboardType="numeric"
                    value={documentId}
                    onChangeText={(text) => {
                      setDocumentId(formatCpfOrCnpj(text));
                      if (error.documentId) setError((prev) => ({ ...prev, documentId: "" }));
                    }}
                    placeholder="__.___.___/____-__ ou ___.___.___-__"
                  />
                  <FieldError>{error.documentId}</FieldError>
                </View>

                <View>
                  <Text className="text-white/90 font-itim text-base mb-1">Categoria</Text>
                  <Pressable
                    onPress={() => setShowCategoryModal(true)}
                    className="flex-row items-center justify-between bg-white rounded-xl p-4"
                  >
                    <Text className={category ? "text-black" : "text-gray-400"}>
                      {category?.name || "Selecione a categoria da loja"}
                    </Text>
                    <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
                  </Pressable>
                  <FieldError>{error.category}</FieldError>
                </View>

                <View>
                  <Text className="text-white/90 font-itim text-base mb-1">Descrição</Text>
                  <TextInput
                    value={description}
                    onChangeText={(text) => {
                      setDescription(text);
                      if (error.description) setError((prev) => ({ ...prev, description: "" }));
                    }}
                    className="bg-white rounded-xl p-4 text-black min-h-[80px]"
                    placeholder="Fale um pouco sobre a sua loja"
                    placeholderTextColor="#9CA3AF"
                    multiline
                    textAlignVertical="top"
                  />
                  <FieldError>{error.description}</FieldError>
                </View>
              </View>

              <View className="gap-3">
                <Text className="text-white font-itim text-lg border-b border-white/20 pb-1">Endereço</Text>

                <View>
                  <Text className="text-white/90 font-itim text-base mb-1">Cidade</Text>
                  <View className="flex-row items-center gap-2 bg-white/50 rounded-xl p-4">
                    <Ionicons name="location-outline" size={18} color="#4B5563" />
                    <Text className="text-gray-700 font-itim">{FIXED_CITY_LABEL}</Text>
                  </View>
                  <Text className="text-white/60 text-xs font-itim mt-1">
                    No momento só é possível cadastrar lojas em Recife
                  </Text>
                </View>

                <View>
                  <Text className="text-white/90 font-itim text-base mb-1">Bairro</Text>
                  <InputWithIcon
                    icon="map-outline"
                    value={neighborhood}
                    onChangeText={(text) => {
                      setNeighborhood(text);
                      if (error.neighborhood) setError((prev) => ({ ...prev, neighborhood: "" }));
                    }}
                    placeholder="Digite o bairro"
                  />
                  <FieldError>{error.neighborhood}</FieldError>
                </View>

                <View>
                  <Text className="text-white/90 font-itim text-base mb-1">Rua</Text>
                  <InputWithIcon
                    icon="navigate-outline"
                    value={street}
                    onChangeText={(text) => {
                      setStreet(text);
                      if (error.street) setError((prev) => ({ ...prev, street: "" }));
                    }}
                    placeholder="Digite a rua"
                  />
                  <FieldError>{error.street}</FieldError>
                </View>

                <View>
                  <Pressable onPress={() => setShowLocationModal(true)} className={`flex-row items-center justify-center gap-2 p-4 rounded-xl active:opacity-80 ${location ? "bg-emerald-600" : "bg-[#EAAA6A]"}`}>
                    <Ionicons name={location ? "checkmark-circle" : "location-outline"} size={18} color="#fff" />
                    <Text className="text-white font-interBold">
                      {location ? "Localização marcada — toque para ajustar" : "Marcar localização da loja no mapa"}
                    </Text>
                  </Pressable>
                  <FieldError>{error.location}</FieldError>
                </View>
              </View>

              <View className="gap-3">
                <Text className="text-white font-itim text-lg border-b border-white/20 pb-1">Segurança</Text>

                <View>
                  <Text className="text-white/90 font-itim text-base mb-1">Senha</Text>
                  <InputWithIcon
                    icon="lock-closed-outline"
                    secureTextEntry
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (error.password) setError((prev) => ({ ...prev, password: "" }));
                    }}
                    placeholder="Digite sua senha"
                  />
                  <FieldError>{error.password}</FieldError>
                </View>

                <View>
                  <Text className="text-white/90 font-itim text-base mb-1">Confirmar senha</Text>
                  <InputWithIcon
                    icon="lock-closed-outline"
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      if (error.confirmPassword) setError((prev) => ({ ...prev, confirmPassword: "" }));
                    }}
                    placeholder="Confirme sua senha"
                  />
                  <FieldError>{error.confirmPassword}</FieldError>
                </View>
              </View>

              <View>
                <View className="flex-row items-start gap-2">
                  <Checkbox
                    value={isChecked}
                    onValueChange={(state) => {
                      setChecked(state);
                      if (error.terms) setError((prev) => ({ ...prev, terms: "" }));
                    }}
                    color={isChecked ? "#EAAA6A" : undefined}
                    className="mt-0.5"
                  />
                  <Text className={`flex-1 text-sm font-roboto ${error.terms ? "text-red-300" : "text-white/90"}`}>
                    Li e aceito os <Text className="text-cyan-400 font-itim">Termos de Uso</Text> e a{" "}
                    <Text className="text-cyan-400 font-itim">Política de Privacidade</Text>.
                  </Text>
                </View>
                <FieldError>{error.terms}</FieldError>
              </View>

              {generalError && (
                <Text className="font-itim text-sm text-red-300 text-center">{generalError}</Text>
              )}

              <Pressable onPress={handleSubmit} className="bg-[#EAAA6A] p-4 items-center justify-center rounded-xl active:opacity-80 flex-row gap-2">
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text className="font-interBold text-black">Cadastrar</Text>
                }
              </Pressable>
            </View>

            <Text className="font-itim text-base text-white text-center mt-6">
              Já possui uma conta? Faça o{" "}
              <Link href={"/shopkeeper/(public)/auth/shopkeeper-login"} className="text-cyan-400">
                Login
              </Link>
            </Text>
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>

      <CategoryModal
        visible={showCategoryModal}
        selectedCategory={category}
        onSelect={(selected) => {
          setCategory(selected);
          if (error.category) setError((prev) => ({ ...prev, category: "" }));
        }}
        onClose={() => setShowCategoryModal(false)}
      />

      <StoreLocationPickerModal
        visible={showLocationModal}
        existingPois={EXISTING_POIS}
        initialLocation={location ?? undefined}
        onConfirm={(coords) => {
          setLocation(coords);
          if (error.location) setError((prev) => ({ ...prev, location: "" }));
        }}
        onClose={() => setShowLocationModal(false)}
      />
    </ImageBackground>
  );
}