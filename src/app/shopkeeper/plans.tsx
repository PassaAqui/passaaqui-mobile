import { View, Text, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface PlanFeature {
  label: string;
}

interface PlanCard {
  name: string;
  tag: string;
  tagVariant: "neutral" | "popular";
  price: string;
  priceSuffix: string;
  features: PlanFeature[];
  buttonLabel: string;
  buttonVariant: "disabled" | "primary";
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
      { label: "Relatórios de vendas e pedidos" },
    ],
    buttonLabel: "Assinar agora",
    buttonVariant: "primary",
    isPremium: true,
  },
];

const HIGHLIGHTS = [
  { icon: "star" as const, label: "Suporte incluído" },
  { icon: "sync" as const, label: "Cancele quando quiser" },
];

export default function Plans() {
  return (
    <View className="flex-1 bg-[#fafafa]">
      <View className="bg-white flex-row items-center px-5 py-5 gap-5">
        <Ionicons name="arrow-back" size={24} color="#000" />
        <Text className="text-lg font-itim">Planos & Assinatura</Text>
      </View>

      <ScrollView className="flex-1">
        <View className="items-center px-5 pt-8 pb-6">
          <View className="w-[50px] h-[50px] bg-[#EAAA6A] rounded-full items-center justify-center mb-4">
            <Ionicons name="crown" size={24} color="#fff" />
          </View>
          <Text className="text-lg font-bold font-itim">Escolha o melhor plano</Text>
          <Text className="text-sm text-gray-500 font-itim text-center mt-1">
            Expanda sua loja e alcance mais turistas em Recife
          </Text>
          <View className="flex-row gap-3 mt-3">
            {HIGHLIGHTS.map((h, i) => (
              <View key={i} className="flex-row items-center gap-1">
                <Ionicons name={h.icon} size={12} color="#888" />
                <Text className="text-[11px] text-gray-500 font-itim">{h.label}</Text>
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
                className={`font-bold font-itim text-base ${
                  plan.isPremium ? "text-white" : "text-black"
                }`}
              >
                {plan.name}
              </Text>
              <View
                className={`rounded-full px-3 py-1 ${
                  plan.tagVariant === "popular" ? "bg-white" : "bg-gray-200"
                }`}
              >
                <Text
                  className={`text-[11px] font-itim ${
                    plan.tagVariant === "popular"
                      ? "text-[#EAAA6A]"
                      : "text-gray-600"
                  }`}
                >
                  {plan.tag}
                </Text>
              </View>
            </View>
            <Text
              className={`text-3xl font-bold font-itim mb-5 ${
                plan.isPremium ? "text-white" : "text-black"
              }`}
            >
              {plan.price}
              <Text
                className={`text-base font-normal font-itim ${
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
                    className={`text-[13px] font-itim ${
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
                  : "bg-white active:opacity-70"
              }`}
            >
              <Text
                className={`font-bold font-itim ${
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

      <View className="flex-row justify-around py-4 border-t border-gray-200 bg-white">
        <View className="items-center">
          <Ionicons name="home" size={20} color="#888" />
          <Text className="text-[11px] text-gray-500 font-itim">Home</Text>
        </View>
        <View className="items-center">
          <Ionicons name="bar-chart" size={20} color="#888" />
          <Text className="text-[11px] text-gray-500 font-itim">Dashboard</Text>
        </View>
        <View className="items-center">
          <Ionicons name="cube" size={20} color="#888" />
          <Text className="text-[11px] text-gray-500 font-itim">Catálogo</Text>
        </View>
        <View className="items-center">
          <Ionicons name="crown" size={20} color="#EAAA6A" />
          <Text className="text-[11px] text-[#EAAA6A] font-itim">Planos</Text>
        </View>
      </View>
    </View>
  );
}
