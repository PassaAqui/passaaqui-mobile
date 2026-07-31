import { useState } from "react";
import { View, Image, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ShopkeeperProduct } from "@/src/features/shopkeeper/catalog/services/shopkeeperProductsService";
import { useDeleteProduct } from "@/src/features/shopkeeper/products/hooks/useDeleteProduct";
import DeleteProductModal from "@/src/features/shopkeeper/products/components/DeleteProductModal";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function ProductCard({ product }: { product: ShopkeeperProduct }) {
  const router = useRouter();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const deleteProductMutation = useDeleteProduct();

  const handleConfirmDelete = () => {
    deleteProductMutation.mutate(product.id, {
      onSuccess: () => setDeleteModalVisible(false),
    });
  };

  return (
    <View className="bg-white border border-[#E8E3DE] rounded-2xl p-3.5 flex-row items-center" style={{ opacity: product.active ? 1 : 0.55 }}>
      <Image
        source={typeof product.image === "string" ? { uri: product.image } : require("@/assets/user/map/tmp/no-image.png")}
        className="w-16 h-16 rounded-xl"
        resizeMode="cover"
      />

      <View className="flex-1 ml-3">
        <View className="flex-row items-center gap-1.5">
          <Text className="font-interBold text-base text-[#2D2D2D] flex-1" numberOfLines={1}>
            {product.name}
          </Text>
          {product.highlight && (
            <View className="bg-[#E7A35A] w-5 h-5 rounded-full items-center justify-center">
              <Ionicons name="star" size={10} color="white" />
            </View>
          )}
        </View>

        <View className="bg-[#FBE6CF] self-start px-2.5 py-0.5 rounded-lg mt-1">
          <Text className="text-[#E7A35A] text-xs font-inter">{product.category}</Text>
        </View>

        <View className="flex-row items-center justify-between mt-2">
          <Text className="font-interBold text-base text-[#2D2D2D]">
            {currencyFormatter.format(product.price)}
          </Text>
          {!product.active && (
            <View className="bg-gray-200 px-2 py-0.5 rounded-lg">
              <Text className="text-gray-500 text-[10px] font-inter">Inativo</Text>
            </View>
          )}
        </View>
      </View>

      <View className="justify-between items-center self-stretch py-1 ml-3 gap-4">
        <TouchableOpacity
          accessibilityLabel={`Editar ${product.name}`}
          onPress={() =>
            router.push({
              pathname: "/shopkeeper/(private)/products/edit-product",
              params: { id: product.id },
            })
          }
        >
          <Ionicons name="pencil-outline" size={17} color="#8A8A8A" />
        </TouchableOpacity>
        <TouchableOpacity accessibilityLabel={`Excluir ${product.name}`} onPress={() => setDeleteModalVisible(true)}>
          <Ionicons name="trash-outline" size={17} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <DeleteProductModal
        visible={deleteModalVisible}
        productName={product.name}
        isDeleting={deleteProductMutation.isPending}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteModalVisible(false)}
      />
    </View>
  );
}