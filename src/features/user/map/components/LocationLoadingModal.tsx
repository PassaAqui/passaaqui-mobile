import { ActivityIndicator, Image, Modal, Text, View } from "react-native";

interface LocationLoadingModalProps {
  visible: boolean;
}

export default function LocationLoadingModal({ visible }: LocationLoadingModalProps) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={() => {}}>
      <View className="flex-1 bg-black/50 items-center justify-center px-6">
        <View className="w-full bg-white p-6 items-center justify-center gap-4 rounded-xl">
          <Image
            className="w-32 h-32"
            source={require("@/assets/user/map/location/world-orbital.png")}
            resizeMode="contain"
          />
          <Text className="font-itim text-2xl text-center text-[#3D2408]">
            Obtendo sua localização
          </Text>
          <Text className="text-center font-itim text-lg">
            Aguarde um momento enquanto localizamos você no mapa.
          </Text>
          <ActivityIndicator size="large" color="#EAAA6A" />
        </View>
      </View>
    </Modal>
  );
}
