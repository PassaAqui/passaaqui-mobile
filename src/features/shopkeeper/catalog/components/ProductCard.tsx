import { View, Image, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface Product {
  id: string;
  name: string;
  category: string;
  price: string;
  image: string;
  featured: boolean;
  active: boolean;
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <View
      className="bg-white border border-[#E8E3DE] rounded-2xl p-3.5 flex-row items-center"
      style={{ opacity: product.active ? 1 : 0.55 }}
    >
      <Image
        source={{ uri: product.image }}
        className="w-16 h-16 rounded-xl"
        resizeMode="cover"
      />

      <View className="flex-1 ml-3">
        <View className="flex-row items-center gap-1.5">
          <Text className="font-interBold text-base text-[#2D2D2D] flex-1" numberOfLines={1}>
            {product.name}
          </Text>
          {product.featured && (
            <View className="bg-[#E7A35A] w-5 h-5 rounded-full items-center justify-center">
              <Ionicons name="star" size={10} color="white" />
            </View>
          )}
        </View>

        <View className="bg-[#FBE6CF] self-start px-2.5 py-0.5 rounded-lg mt-1">
          <Text className="text-[#E7A35A] text-xs font-inter">{product.category}</Text>
        </View>

        <View className="flex-row items-center justify-between mt-2">
          <Text className="font-interBold text-base text-[#2D2D2D]">{product.price}</Text>
          {!product.active && (
            <View className="bg-gray-200 px-2 py-0.5 rounded-lg">
              <Text className="text-gray-500 text-[10px] font-inter">Inativo</Text>
            </View>
          )}
        </View>
      </View>

      <View className="justify-between items-center self-stretch py-1 ml-3 gap-4">
        <TouchableOpacity accessibilityLabel={`Editar ${product.name}`}>
          <Ionicons name="pencil-outline" size={17} color="#8A8A8A" />
        </TouchableOpacity>
        <TouchableOpacity accessibilityLabel={`Excluir ${product.name}`}>
          <Ionicons name="trash-outline" size={17} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
}