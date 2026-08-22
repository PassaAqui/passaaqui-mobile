import { Image, Text, Pressable, Modal, ActivityIndicator } from "react-native";

interface DeleteProductModalProps {
  visible: boolean;
  productName: string;
  isDeleting?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function DeleteProductModal({ visible, productName, isDeleting, onConfirm, onClose }: DeleteProductModalProps) {
  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <Pressable onPress={onClose} className="flex-1 bg-black/50 items-center justify-center px-6">
        <Pressable onPress={() => {}} className="w-full bg-white p-6 items-center justify-center gap-3 rounded-xl">
          <Image className="w-24 h-24" source={require("@/assets/user/map/alert.png")} />
          <Text className="font-itim text-3xl text-red-500">ATENÇÃO!</Text>

          <Text className="text-center font-itim text-lg">
            Você tem certeza que deseja excluir{"\n"}{"\u201C"}{productName}{"\u201D"}? Essa ação não pode ser desfeita.
          </Text>

          <Pressable
            onPress={onConfirm}
            disabled={isDeleting}
            className="bg-red-400 w-full p-4 items-center justify-center rounded-lg active:opacity-45"
            style={{ opacity: isDeleting ? 0.6 : 1 }}
          >
            {isDeleting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-xl font-itim text-center text-white">Confirmar exclusão</Text>
            )}
          </Pressable>

          <Pressable onPress={onClose} className="w-full p-2 items-center justify-center">
            <Text className="text-base font-itim text-gray-500">Cancelar</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}