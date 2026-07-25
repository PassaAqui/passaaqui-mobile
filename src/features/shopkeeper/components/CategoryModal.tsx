import { FlatList, Modal, Pressable, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface CategoryData {
  id: number;
  name: string;
}

// substituir por chamada pra API (GET /categories) quando terminar de fazer as outras telas do lojista
const MOCK_CATEGORIES: CategoryData[] = [
  { id: 1, name: "Tapioca" },
  { id: 2, name: "Bebidas" },
  { id: 3, name: "Bolos e doces" },
  { id: 4, name: "Salgados" },
  { id: 5, name: "Sorvetes" },
  { id: 6, name: "Artesanato" },
];

interface CategoryModalProps {
  visible: boolean;
  onClose: () => void;
  selectedCategory: CategoryData | null;
  onSelect: (category: CategoryData) => void;
}

export function CategoryModal({ visible, onClose, selectedCategory, onSelect }: CategoryModalProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/40 justify-end" onPress={onClose}>
        <View className="bg-white rounded-t-3xl p-5" style={{ paddingBottom: insets.bottom + 16 }}>
          <View className="w-10 h-1 bg-gray-300 rounded-full self-center mb-4" />
          <Text className="text-lg font-interBold mb-3">Selecione a categoria</Text>

          <FlatList
            data={MOCK_CATEGORIES}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
                className="flex-row items-center justify-between py-4 border-b border-gray-100"
              >
                <Text className="text-sm font-inter">{item.name}</Text>
                {selectedCategory?.id === item.id && (
                  <Ionicons name="checkmark" size={18} color="#EAAA6A" />
                )}
              </Pressable>
            )}
          />
        </View>
      </Pressable>
    </Modal>
  );
}