import { View, Text, ScrollView, TextInput, Pressable, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { CategoryModal } from "@/src/features/roles/shopkeeper/components/CategoryModal";
import { useCreateProductForm } from "@/src/features/roles/shopkeeper/products/hooks/useCreateProductForm";
import { useRouter } from "expo-router";

export default function CreateProductScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const {
    name,
    category,
    categoryModalVisible,
    description,
    originalPrice,
    discount,
    xpCost,
    quantity,
    images,
    errors,
    finalPrice,
    descriptionMaxLength,
    maxImages,
    handleNameChange,
    handleSelectCategory,
    handleDescriptionChange,
    handleOriginalPriceChange,
    setDiscount,
    setXpCost,
    incrementQuantity,
    decrementQuantity,
    pickImages,
    removeImage,
    handlePublish,
    openCategoryModal,
    closeCategoryModal,
  } = useCreateProductForm();

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-white">
      <View className="flex-row items-center p-5 border-b border-gray-200">
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#000"  className="py-3"/>
        </Pressable>
        <View className="flex-1 justify-center items-center pr-5">
          <Text className="text-lg font-interBold text-center">Novo Produto</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-5 pt-5" contentContainerStyle={{ paddingBottom: insets.bottom + 16 }} showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-sm font-interBold text-gray-500">FOTO DO PRODUTO</Text>
          <Text className="text-xs text-gray-400 font-inter">{images.length}/{maxImages}</Text>
        </View>

        {images.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
            <View className="flex-row gap-3">
              {images.map((img) => (
                <View key={img.uri} className="relative">
                  <Image source={{ uri: img.uri }} className="w-20 h-20 rounded-xl" />
                  <Pressable
                    onPress={() => removeImage(img.uri)}
                    className="absolute -top-2 -right-2 bg-white rounded-full p-1 border border-gray-200 active:opacity-70"
                  >
                    <Ionicons name="close-circle" size={20} color="#DC2626" />
                  </Pressable>
                </View>
              ))}
            </View>
          </ScrollView>
        )}

        {images.length < maxImages && (
          <Pressable
            onPress={pickImages}
            className={`border-2 border-dashed rounded-2xl py-10 items-center bg-[#fff9f4] mb-1 active:opacity-70 ${
              errors.images ? "border-red-500" : "border-[#EAAA6A]"
            }`}
          >
            <View className="w-12 h-12 rounded-full bg-[#F5F0EB] items-center justify-center">
              <Ionicons name="add" size={24} color="#EAAA6A" />
            </View>
            <Text className="text-[#EAAA6A] font-interBold mt-2">
              {images.length === 0 ? "Adicionar foto" : "Adicionar mais fotos"}
            </Text>
            <Text className="text-[11px] text-gray-400 font-inter mt-1">
              JPG ou PNG até 5MB · até {maxImages} fotos
            </Text>
          </Pressable>
        )}

        {errors.images && (
          <Text className="text-xs text-red-500 font-inter mt-1 mb-5">{errors.images}</Text>
        )}
        {!errors.images && <View className="mb-6" />}

        <Text className="text-sm font-interBold text-gray-500 mb-4">INFORMAÇÕES BÁSICAS</Text>

        <View className="border-2 border-[#EAAA6A] rounded-2xl p-4 mb-6">
          <View className="mb-4">
            <Text className="text-xs text-gray-500 mb-1 font-inter">NOME DO PRODUTO *</Text>
            <TextInput
              value={name}
              onChangeText={handleNameChange}
              placeholder="Ex: Tapioca Clássica"
              placeholderTextColor="#9CA3AF"
              className={`w-full bg-gray-100 border rounded-xl p-3 text-sm font-inter ${
                errors.name ? "border-red-500" : "border-gray-200"
              }`}
            />
            {errors.name && <Text className="text-xs text-red-500 font-inter mt-1">{errors.name}</Text>}
          </View>

          <View className="mb-4">
            <Text className="text-xs text-gray-500 mb-1 font-inter">CATEGORIA *</Text>
            <Pressable
              onPress={openCategoryModal}
              className={`w-full bg-gray-100 border rounded-xl p-3 flex-row items-center justify-between ${
                errors.category ? "border-red-500" : "border-gray-200"
              }`}
            >
              <Text className={`text-sm font-inter ${category ? "text-black" : "text-gray-400"}`}>
                {category || "Selecione uma categoria"}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#888" />
            </Pressable>
            {errors.category && <Text className="text-xs text-red-500 font-inter mt-1">{errors.category}</Text>}
          </View>

          <View>
            <Text className="text-xs text-gray-500 mb-1 font-inter">DESCRIÇÃO</Text>
            <TextInput
              value={description}
              onChangeText={handleDescriptionChange}
              placeholder="Descreva o produto..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              maxLength={descriptionMaxLength}
              className="w-full bg-gray-100 border border-gray-200 rounded-xl p-3 text-sm font-inter h-24"
              textAlignVertical="top"
            />
            <Text className="text-[10px] text-gray-400 font-inter text-right mt-1">
              {description.length}/{descriptionMaxLength}
            </Text>
          </View>
        </View>

        <Text className="text-sm font-interBold text-gray-500 mb-4">PREÇO E DESCONTO</Text>

        <View className="border-2 border-[#EAAA6A] rounded-2xl p-4 mb-6">
          <View className="flex-row gap-4 mb-1">
            <View className="flex-1">
              <Text className="text-xs text-gray-500 mb-1 font-inter">PREÇO ORIGINAL *</Text>
              <TextInput
                value={originalPrice}
                onChangeText={handleOriginalPriceChange}
                placeholder="R$ 0,00"
                placeholderTextColor="#9CA3AF"
                keyboardType="decimal-pad"
                className={`w-full bg-gray-100 border rounded-xl p-3 text-sm font-inter ${
                  errors.originalPrice ? "border-red-500" : "border-gray-200"
                }`}
              />
            </View>
            <View className="flex-1">
              <Text className="text-xs text-gray-500 mb-1 font-inter">DESCONTO (R$)</Text>
              <TextInput
                value={discount}
                onChangeText={setDiscount}
                placeholder="R$ 0,00"
                placeholderTextColor="#9CA3AF"
                keyboardType="decimal-pad"
                className="w-full bg-gray-100 border border-gray-200 rounded-xl p-3 text-sm font-inter"
              />
            </View>
          </View>
          {errors.originalPrice && (
            <Text className="text-xs text-red-500 font-inter mb-3">{errors.originalPrice}</Text>
          )}

          <View className="bg-gray-100 rounded-xl p-4 flex-row justify-between items-center mt-3">
            <Text className="text-sm font-inter">Preço final para o cliente</Text>
            <Text className="font-interBold">
              R$ {finalPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>

        <Text className="text-sm font-interBold text-gray-500 mb-4">XP E ESTOQUE</Text>

        <View className={`border-2 rounded-2xl p-4 mb-1 ${errors.quantity ? "border-red-500" : "border-[#EAAA6A]"}`}>
          <View className="flex-row gap-4">
            <View className="flex-1">
              <Text className="text-xs text-gray-500 mb-1 font-inter">CUSTO EM XP</Text>
              <View className="w-full bg-gray-100 border border-gray-200 rounded-xl p-3 flex-row items-center gap-2">
                <Ionicons name="ellipse" size={14} color="#EAAA6A" />
                <TextInput
                  value={xpCost}
                  onChangeText={setXpCost}
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="number-pad"
                  className="flex-1 text-sm font-interBold text-[#A86830]"
                />
                <Text className="text-sm font-interBold text-[#A86830]">XP</Text>
              </View>
            </View>

            <View className="flex-1">
              <Text className="text-xs text-gray-500 mb-1 font-inter">QUANTIDADE *</Text>
              <View className="w-full flex-row items-center justify-between">
                <Pressable
                  onPress={decrementQuantity}
                  className="w-9 h-9 rounded-full border border-gray-300 items-center justify-center active:opacity-70"
                >
                  <Ionicons name="remove" size={18} color="#000" />
                </Pressable>
                <Text className="text-base font-interBold">{quantity}</Text>
                <Pressable
                  onPress={incrementQuantity}
                  className="w-9 h-9 rounded-full border border-gray-300 items-center justify-center active:opacity-70"
                >
                  <Ionicons name="add" size={18} color="#000" />
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        {errors.quantity && (
          <Text className="text-xs text-red-500 font-inter mt-1 mb-4">{errors.quantity}</Text>
        )}
        {!errors.quantity && <View className="mb-4" />}

        <View className="bg-[#FFF9E7] border border-[#FFEBB0] rounded-xl p-4 flex-row gap-3 mb-5">
          <Ionicons name="alert-circle" size={21} color="#F2C94C" />
          <Text className="text-sm text-[#856404] font-inter flex-1">
            Revise todos os dados antes de publicar. Após a publicação, o produto ficará visível na loja imediatamente.
          </Text>
        </View>

        {Object.keys(errors).length > 0 && (
          <View className="bg-red-50 border border-red-200 rounded-xl p-4 flex-row gap-3 mb-5">
            <Ionicons name="close-circle" size={21} color="#DC2626" />
            <Text className="text-sm text-red-600 font-inter flex-1">
              Corrija os campos destacados antes de publicar o produto.
            </Text>
          </View>
        )}

        <Pressable onPress={handlePublish} className="w-full bg-[#EAAA6A] py-5 rounded-2xl items-center mb-8 active:opacity-70">
          <Text className="text-white font-interBold text-lg">Publicar produto</Text>
        </Pressable>
      </ScrollView>

      <CategoryModal
        visible={categoryModalVisible}
        onClose={closeCategoryModal}
        selectedCategory={category}
        onSelect={handleSelectCategory}
      />
    </SafeAreaView>
  );
}