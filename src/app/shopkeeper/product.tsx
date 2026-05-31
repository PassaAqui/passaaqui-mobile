import { View, Text, ScrollView, TextInput, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Product() {
  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center px-5 py-5 border-b border-gray-200 gap-20">
        <Ionicons name="chevron-back" size={24} color="#000" />
        <Text className="text-lg font-itim">Novo Produto</Text>
      </View>

      <ScrollView className="flex-1 px-5 pt-5">
        <Text className="text-[10px] font-bold text-gray-500 mb-2 font-itim">
          FOTO DO PRODUTO
        </Text>
        <View className="border-2 border-dashed border-[#EAAA6A] rounded-2xl py-10 items-center bg-[#fff9f4] mb-6">
          <Ionicons name="add" size={28} color="#EAAA6A" />
          <Text className="text-[#EAAA6A] font-bold font-itim mt-2">Adicionar foto</Text>
          <Text className="text-[11px] text-gray-400 font-itim mt-1">JPG ou PNG até 5MB</Text>
        </View>

        <Text className="text-[10px] font-bold text-gray-500 mb-4 font-itim">
          INFORMAÇÕES BÁSICAS
        </Text>

        <View className="mb-4">
          <Text className="text-[10px] text-gray-400 mb-1 font-itim">NOME DO PRODUTO</Text>
          <TextInput
            value="Tapioca Clássica"
            className="w-full bg-gray-100 border border-gray-200 rounded-xl p-3 text-sm font-itim"
          />
        </View>

        <View className="mb-4">
          <Text className="text-[10px] text-gray-400 mb-1 font-itim">DESCRIÇÃO</Text>
          <TextInput
            value="Tapioca feita na hora com goma fresca..."
            multiline
            className="w-full bg-gray-100 border border-gray-200 rounded-xl p-3 text-sm font-itim"
          />
        </View>

        <View className="flex-row gap-4 mb-4">
          <View className="flex-1">
            <Text className="text-[10px] text-gray-400 mb-1 font-itim">PREÇO ORIGINAL</Text>
            <TextInput
              value="R$ 25,00"
              className="w-full bg-gray-100 border border-gray-200 rounded-xl p-3 text-sm font-itim"
            />
          </View>
          <View className="flex-1">
            <Text className="text-[10px] text-gray-400 mb-1 font-itim">DESCONTO (R$)</Text>
            <TextInput
              value="R$ 5,00"
              className="w-full bg-gray-100 border border-gray-200 rounded-xl p-3 text-sm font-itim"
            />
          </View>
        </View>

        <View className="bg-gray-100 rounded-xl p-4 flex-row justify-between items-center mb-4">
          <Text className="text-sm font-itim">Preço final para o cliente</Text>
          <Text className="font-bold font-itim">R$ 20,00</Text>
        </View>

        <View className="bg-[#FFF9E7] border border-[#FFEBB0] rounded-xl p-4 flex-row gap-3 mb-5">
          <Ionicons name="alert-circle" size={20} color="#F2C94C" />
          <Text className="text-[11px] text-[#856404] font-itim flex-1">
            Revise todos os dados antes de publicar. O produto ficará visível imediatamente.
          </Text>
        </View>

        <Pressable className="w-full bg-[#EAAA6A] py-5 rounded-2xl items-center mb-8 active:opacity-70">
          <Text className="text-white font-bold text-base font-itim">Publicar produto</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
