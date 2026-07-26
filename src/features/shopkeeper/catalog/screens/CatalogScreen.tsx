import { useState } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ProductCard, Product } from "@/src/features/shopkeeper/catalog/components/ProductCard";

// ─── Mock data ────────────────────────────────────────────────────────────────
// TODO: substituir por chamada à API (GET /shopkeeper/products) quando o backend estiver pronto

const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Açaí Natural",
    category: "Bebidas",
    price: "R$ 8,50",
    image: "https://images.unsplash.com/photo-1625943555419-56a2cb596640?w=300",
    featured: false,
    active: true,
  },
  {
    id: "2",
    name: "Tapioca Clássica",
    category: "Comidas",
    price: "R$ 12,00",
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=300",
    featured: true,
    active: true,
  },
  {
    id: "3",
    name: "Água de Coco",
    category: "Bebidas",
    price: "R$ 5,00",
    image: "https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=300",
    featured: false,
    active: true,
  },
  {
    id: "4",
    name: "Pastel de Camarão",
    category: "Comidas",
    price: "R$ 15,50",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300",
    featured: false,
    active: false,
  },
  {
    id: "5",
    name: "Coxinha de Frango",
    category: "Comidas",
    price: "R$ 7,50",
    image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=300",
    featured: true,
    active: true,
  },
];

const FILTERS = ["GASTRONOMIA", "DISPONÍVEL", "ARTESANATO"] as const;
type Filter = (typeof FILTERS)[number];

export default function CatalogScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<Filter>("GASTRONOMIA");
  const [search, setSearch] = useState("");

  const filtered = PRODUCTS.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    if (activeFilter === "GASTRONOMIA") return p.category === "Comidas" && matchSearch;
    if (activeFilter === "DISPONÍVEL")  return p.active === true && matchSearch;
    return matchSearch; // ARTESANATO — mostra todos por ora
  });

  const totalActive   = PRODUCTS.filter((p) => p.active).length;
  const totalFeatured = PRODUCTS.filter((p) => p.featured).length;

  // Altura do botão flutuante + respiro acima da bottom tab bar nativa
  const floatingButtonSpace = insets.bottom + 88;

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-[#F8F5F2]">
      <View className="flex-row items-center justify-center py-4" style={{ paddingTop: insets.top }}>
        <Text className="text-xl font-interBold text-[#2D2D2D]">Meu Catálogo</Text>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: floatingButtonSpace }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="px-5 pt-5 pb-4 bg-[#F8F5F2] border-b border-[#E8E3DE]">
          {/* Search */}
          <View className="flex-row items-center bg-[#F3F3F3] rounded-xl px-3.5 h-11 mt-3">
            <Ionicons name="search-outline" size={17} color="#8A8A8A" />
            <TextInput
              placeholder="Buscar produto..."
              placeholderTextColor="#8A8A8A"
              className="flex-1 ml-2 font-inter text-sm text-[#2D2D2D]"
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
              accessibilityLabel="Campo de busca de produtos"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Ionicons name="close-circle" size={17} color="#8A8A8A" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Summary cards */}
        <View className="flex-row px-5 mt-4 gap-2.5">
          {[
            { icon: "bag-handle-outline" as const,        value: PRODUCTS.length, label: "Produtos" },
            { icon: "checkmark-circle-outline" as const,  value: totalActive,     label: "Ativos"   },
            { icon: "star-outline" as const,              value: totalFeatured,   label: "Destaque" },
          ].map(({ icon, value, label }) => (
            <View key={label} className="flex-1 bg-[#E7A35A] rounded-2xl py-3.5 items-center">
              <Ionicons name={icon} size={19} color="white" />
              <Text
                className="text-white text-2xl font-interBold mt-1"
                adjustsFontSizeToFit
                numberOfLines={1}
              >
                {value}
              </Text>
              <Text className="text-white text-xs font-inter mt-0.5">{label}</Text>
            </View>
          ))}
        </View>

        {/* Category filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
          className="mt-4"
        >
          {FILTERS.map((f) => {
            const active = activeFilter === f;
            return (
              <TouchableOpacity
                key={f}
                onPress={() => setActiveFilter(f)}
                className={`px-4 py-2 rounded-full border ${
                  active ? "bg-[#E7A35A] border-[#E7A35A]" : "bg-white border-[#E8E3DE]"
                }`}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <Text className={`font-inter text-sm ${active ? "text-white" : "text-[#8A8A8A]"}`}>
                  {f}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* List header */}
        <View className="flex-row items-center gap-2 px-5 mt-6 mb-3">
          <Ionicons name="clipboard-outline" size={16} color="#2D2D2D" />
          <Text className="font-interBold text-base text-[#2D2D2D]">Produtos cadastrados</Text>
          <View className="flex-1" />
          <TouchableOpacity
            className="flex-row items-center gap-1"
            accessibilityLabel="Ordenar produtos"
          >
            <Text className="font-inter text-sm text-[#8A8A8A]">Ordenar</Text>
            <Ionicons name="swap-vertical-outline" size={14} color="#8A8A8A" />
          </TouchableOpacity>
        </View>

        {/* Product list */}
        <View className="px-5">
          {filtered.length === 0 ? (
            <View className="items-center py-16">
              <Ionicons name="search-outline" size={44} color="#E8E3DE" />
              <Text className="font-inter text-[#8A8A8A] mt-3">Nenhum produto encontrado</Text>
            </View>
          ) : (
            <View className="gap-3">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Botão flutuante — posicionado acima da bottom tab bar via insets */}
      <TouchableOpacity
        className="absolute self-center bottom-3 bg-[#E7A35A] px-6 py-3.5 rounded-full flex-row items-center"
        style={{
          shadowColor: "#E7A35A",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.35,
          shadowRadius: 8,
          elevation: 6,
        }}
        onPress={() =>
          router.push({
            pathname: "/shopkeeper/(private)/products/create-product",
          })
        }
        accessibilityRole="button"
        accessibilityLabel="Adicionar novo produto"
      >
        <Ionicons name="add" size={20} color="white" />
        <Text className="text-white text-sm font-interBold ml-1.5">Adicionar Produto</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}