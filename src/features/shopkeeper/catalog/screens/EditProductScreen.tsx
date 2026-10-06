import { View, Text, TextInput, Pressable, Image, ActivityIndicator, ScrollView } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { CategoryModal } from "@/src/features/shopkeeper/components/CategoryModal";
import { useEditProductForm } from "@/src/features/shopkeeper/products/hooks/useEditProductForm";

export default function EditProductScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const productId = Number(id);

  const {
    isLoadingProduct,
    isProductError,
    name,
    category,
    categoryModalVisible,
    description,
    price,
    quantity,
    active,
    highlight,
    existingImages,
    newImages,
    errors,
    descriptionMaxLength,
    maxImages,
    totalImagesCount,
    isSubmitting,
    submitError,
    handleNameChange,
    handleSelectCategory,
    handleDescriptionChange,
    handlePriceChange,
    incrementQuantity,
    decrementQuantity,
    setActive,
    setHighlight,
    pickImages,
    removeExistingImage,
    removeNewImage,
    handleSave,
    openCategoryModal,
    closeCategoryModal,
  } = useEditProductForm(productId);

  if (isLoadingProduct) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator color="#EAAA6A" size="large" />
      </SafeAreaView>
    );
  }

  if (isProductError) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-white items-center justify-center px-6">
        <Ionicons name="alert-circle-outline" size={44} color="#E8E3DE" />
        <Text className="font-inter text-[#8A8A8A] mt-3 text-center">
          Não foi possível carregar o produto
        </Text>
        <Pressable onPress={() => router.back()} className="mt-4 px-5 py-2.5 bg-[#EAAA6A] rounded-xl">
          <Text className="text-white font-interBold">Voltar</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-white">
      <View className="flex-row items-center p-5 border-b border-gray-200">
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#000" className="py-3" />
        </Pressable>
        <View className="flex-1 justify-center items-center pr-5">
          <Text className="text-lg font-interBold text-center">Editar Produto</Text>
        </View>
      </View>

      <KeyboardAwareScrollView
        bottomOffset={16}
        className="flex-1 px-5 pt-5"
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Fotos */}
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-sm font-interBold text-gray-500">FOTO DO PRODUTO</Text>
          <Text className="text-xs text-gray-400 font-inter">{totalImagesCount}/{maxImages}</Text>
        </View>

        {(existingImages.length > 0 || newImages.length > 0) && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
            <View className="flex-row gap-3">
              {existingImages.map((uri, index) => (
                <View key={`existing-${uri}`} className="relative">
                  <Image source={{ uri }} className="w-20 h-20 rounded-xl" />
                  <Pressable
                    onPress={() => removeExistingImage(index)}
                    className="absolute -top-2 -right-2 bg-white rounded-full p-1 border border-gray-200 active:opacity-70"
                  >
                    <Ionicons name="close-circle" size={20} color="#DC2626" />
                  </Pressable>
                </View>
              ))}
              {newImages.map((img) => (
                <View key={`new-${img.uri}`} className="relative">
                  <Image source={{ uri: img.uri }} className="w-20 h-20 rounded-xl" />
                  <View className="absolute bottom-0 left-0 bg-[#EAAA6A] px-1.5 py-0.5 rounded-tr-lg rounded-bl-xl">
                    <Text className="text-[9px] text-white font-interBold">NOVA</Text>
                  </View>
                  <Pressable
                    onPress={() => removeNewImage(img.uri)}
                    className="absolute -top-2 -right-2 bg-white rounded-full p-1 border border-gray-200 active:opacity-70"
                  >
                    <Ionicons name="close-circle" size={20} color="#DC2626" />
                  </Pressable>
                </View>
              ))}
            </View>
          </ScrollView>
        )}

        {totalImagesCount < maxImages && (
          <Pressable
            onPress={pickImages}
            className="border-2 border-dashed rounded-2xl py-10 items-center bg-[#fff9f4] mb-6 border-[#EAAA6A] active:opacity-70"
          >
            <View className="w-12 h-12 rounded-full bg-[#F5F0EB] items-center justify-center">
              <Ionicons name="add" size={24} color="#EAAA6A" />
            </View>
            <Text className="text-[#EAAA6A] font-interBold mt-2">Adicionar foto</Text>
            <Text className="text-[11px] text-gray-400 font-inter mt-1">
              JPG ou PNG até 5MB · até {maxImages} fotos
            </Text>
          </Pressable>
        )}
        {totalImagesCount >= maxImages && <View className="mb-6" />}

        {/* Informações básicas */}
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
                {category?.name || "Selecione uma categoria"}
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

        {/* Preço */}
        <Text className="text-sm font-interBold text-gray-500 mb-4">PREÇO</Text>
        <View className="border-2 border-[#EAAA6A] rounded-2xl p-4 mb-6">
          <Text className="text-xs text-gray-500 mb-1 font-inter">PREÇO *</Text>
          <TextInput
            value={price}
            onChangeText={handlePriceChange}
            placeholder="R$ 0,00"
            placeholderTextColor="#9CA3AF"
            keyboardType="decimal-pad"
            className={`w-full bg-gray-100 border rounded-xl p-3 text-sm font-inter ${
              errors.price ? "border-red-500" : "border-gray-200"
            }`}
          />
          {errors.price && <Text className="text-xs text-red-500 font-inter mt-1">{errors.price}</Text>}
        </View>

        {/* Estoque */}
        <Text className="text-sm font-interBold text-gray-500 mb-4">ESTOQUE</Text>
        <View className={`border-2 rounded-2xl p-4 mb-1 ${errors.quantity ? "border-red-500" : "border-[#EAAA6A]"}`}>
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
        {errors.quantity && <Text className="text-xs text-red-500 font-inter mt-1 mb-4">{errors.quantity}</Text>}
        {!errors.quantity && <View className="mb-4" />}

        {/* Visibilidade — exclusivo da edição */}
        <Text className="text-sm font-interBold text-gray-500 mb-4">VISIBILIDADE</Text>
        <View className="border-2 border-[#EAAA6A] rounded-2xl p-4 mb-6 gap-4">
          <Pressable onPress={() => setActive(!active)} className="flex-row items-center justify-between">
            <View className="flex-1 pr-3">
              <Text className="text-sm font-interBold text-[#2D2D2D]">Produto ativo</Text>
              <Text className="text-xs text-gray-400 font-inter">Produtos inativos não aparecem na loja</Text>
            </View>
            <View className={`w-12 h-7 rounded-full justify-center ${active ? "bg-[#EAAA6A]" : "bg-gray-300"}`}>
              <View
                className="w-5 h-5 rounded-full bg-white"
                style={{ marginLeft: active ? 26 : 4 }}
              />
            </View>
          </Pressable>

          <Pressable onPress={() => setHighlight(!highlight)} className="flex-row items-center justify-between">
            <View className="flex-1 pr-3">
              <Text className="text-sm font-interBold text-[#2D2D2D]">Destacar produto</Text>
              <Text className="text-xs text-gray-400 font-inter">Produtos em destaque ganham um selo especial</Text>
            </View>
            <View className={`w-12 h-7 rounded-full justify-center ${highlight ? "bg-[#EAAA6A]" : "bg-gray-300"}`}>
              <View
                className="w-5 h-5 rounded-full bg-white"
                style={{ marginLeft: highlight ? 26 : 4 }}
              />
            </View>
          </Pressable>
        </View>

        {Object.keys(errors).length > 0 && (
          <View className="bg-red-50 border border-red-200 rounded-xl p-4 flex-row gap-3 mb-5">
            <Ionicons name="close-circle" size={21} color="#DC2626" />
            <Text className="text-sm text-red-600 font-inter flex-1">
              Corrija os campos destacados antes de salvar as alterações.
            </Text>
          </View>
        )}

        <Pressable
          onPress={() => handleSave(() => router.back())}
          disabled={isSubmitting}
          className="w-full bg-[#EAAA6A] py-5 rounded-2xl items-center mb-8 active:opacity-70"
          style={{ opacity: isSubmitting ? 0.6 : 1 }}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-interBold text-lg">Salvar alterações</Text>
          )}
        </Pressable>

        {submitError && (
          <View className="bg-red-50 border border-red-200 rounded-xl p-4 flex-row gap-3 mb-5">
            <Ionicons name="close-circle" size={21} color="#DC2626" />
            <Text className="text-sm text-red-600 font-inter flex-1">
              Não foi possível salvar as alterações. Tente novamente.
            </Text>
          </View>
        )}
      </KeyboardAwareScrollView>

      <CategoryModal
        visible={categoryModalVisible}
        onClose={closeCategoryModal}
        selectedCategory={category}
        onSelect={handleSelectCategory}
      />
    </SafeAreaView>
  );
}