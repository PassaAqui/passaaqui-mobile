import { View, Text, ScrollView, Pressable, Image } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface PlanFeature {
  label: string;
}

interface PlanCard {
  name: string;
  tag: string;
  tagVariant: "neutral" | "popular" | "best";
  price: string;
  priceSuffix: string;
  features: PlanFeature[];
  buttonLabel: string;
  buttonVariant: "disabled" | "primary" | "outline";
  isPremium?: boolean;
}

const PLANS: PlanCard[] = [
  {
    name: "Básico",
    tag: "Gratuito",
    tagVariant: "neutral",
    price: "R$ 0",
    priceSuffix: "/mês",
    features: [
      { label: "Até 10 produtos cadastrados" },
      { label: "Perfil da loja no mapa" },
      { label: "Recebe pedidos pelo app" },
      { label: "Suporte por e-mail" },
    ],
    buttonLabel: "Plano atual",
    buttonVariant: "disabled",
  },
  {
    name: "Profissional",
    tag: "Mais popular",
    tagVariant: "popular",
    price: "R$ 49,90",
    priceSuffix: "/mês",
    features: [
      { label: "Produtos ilimitados no catálogo" },
      { label: "Destaque no mapa para turistas" },
      { label: "Aceitar cupons de XP dos turistas" },
      { label: "Relatórios de vendas e pedidos" },
      { label: "Suporte prioritário via chat" },
      { label: "Taxa reduzida nas vendas" },
    ],
    buttonLabel: "Assinar agora",
    buttonVariant: "primary",
    isPremium: true,
  },
  {
    name: "Premium",
    tag: "Melhor valor",
    tagVariant: "best",
    price: "R$ 99,90",
    priceSuffix: "/mês",
    features: [
      { label: "Tudo do plano Profissional" },
      { label: "Campanhas de XP para atrair turistas" },
      { label: "Integração com rotas do app" },
      { label: "Relatório financeiro completo" },
      { label: "Gerente de conta dedicado" },
      { label: "Prioridade máxima no mapa" },
    ],
    buttonLabel: "Assinar agora",
    buttonVariant: "outline",
  },
];

const HIGHLIGHTS = [
  { icon: "star" as const, label: "Suporte incluído" },
  { icon: "shield-checkmark" as const, label: "Seguro" },
  { icon: "sync" as const, label: "Cancele quando quiser" }
];

export default function PlansScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-[#fafafa]">
      <View className="bg-[#fafafa] flex-row items-center px-5 py-5 gap-5">
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <View className="flex-1 justify-center items-center pr-5">
          <Text className="text-lg text-center font-interBold">Planos & Assinatura</Text>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: insets.bottom + 16 }} showsVerticalScrollIndicator={false}>
        <View className="items-center px-5 py-8">
          <View className="w-24 h-24 bg-[#EAAA6A] rounded-full items-center justify-center mb-4">
            <Image source={require("@/assets/shopkeeper/plans/crown.png")} className="w-12 h-8" />
          </View>
          <Text className="text-2xl font-interBold">Escolha o melhor plano</Text>
          <Text className="text-base text-gray-500 font-inter text-center mt-1 w-4/5">
            Expanda sua loja e alcance mais turistas em Recife
          </Text>
          <View className="flex-row flex-wrap w-3/4 gap-3 mt-3 items-center justify-center">
            {HIGHLIGHTS.map((h, i) => (
              <View key={i} className="flex-row items-center justify-center gap-1">
                <Ionicons name={h.icon} size={20} color="#EAAA6A" />
                <Text className="text-sm text-gray-500 font-inter">{h.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {PLANS.map((plan, i) => (
          <View
            key={i}
            className={`mx-4 rounded-2xl p-5 mb-4 ${
              plan.isPremium
                ? "bg-[#EAAA6A]"
                : "bg-white border border-gray-200"
            }`}
          >
            <View className="flex-row justify-between items-center mb-3">
              <Text
                className={`font-interBold text-base ${
                  plan.isPremium ? "text-white" : "text-black"
                }`}
              >
                {plan.name}
              </Text>
              <View
                className={`rounded-full px-3 py-1 ${
                  plan.tagVariant === "popular"
                    ? "bg-white"
                    : plan.tagVariant === "best"
                    ? "bg-[#FEF3E2]"
                    : "bg-gray-200"
                }`}
              >
                <Text
                  className={`text-[11px] font-inter ${
                    plan.tagVariant === "popular"
                      ? "text-[#EAAA6A]"
                      : plan.tagVariant === "best"
                      ? "text-[#A86830]"
                      : "text-gray-600"
                  }`}
                >
                  {plan.tag}
                </Text>
              </View>
            </View>

            <Text
              className={`text-3xl font-interBold mb-5 ${
                plan.isPremium ? "text-white" : "text-black"
              }`}
            >
              {plan.price}
              <Text
                className={`text-base font-inter ${
                  plan.isPremium ? "text-white/80" : "text-black"
                }`}
              >
                {plan.priceSuffix}
              </Text>
            </Text>

            <View className="mb-5">
              {plan.features.map((f, j) => (
                <View key={j} className="flex-row items-center gap-3 mb-2">
                  <Ionicons
                    name="checkmark"
                    size={16}
                    color={plan.isPremium ? "#fff" : "#EAAA6A"}
                  />
                  <Text
                    className={`text-[13px] font-inter flex-1 ${
                      plan.isPremium ? "text-white" : "text-black"
                    }`}
                  >
                    {f.label}
                  </Text>
                </View>
              ))}
            </View>

            <Pressable
              className={`w-full py-3 rounded-xl items-center ${
                plan.buttonVariant === "disabled"
                  ? "bg-gray-200"
                  : plan.buttonVariant === "outline"
                  ? "bg-transparent border border-[#EAAA6A] active:opacity-70"
                  : "bg-white active:opacity-70"
              }`}
            >
              <Text
                className={`font-interBold ${
                  plan.buttonVariant === "disabled"
                    ? "text-gray-500"
                    : "text-[#EAAA6A]"
                }`}
              >
                {plan.buttonLabel}
              </Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}