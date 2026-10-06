import { Modal, View, Image, Text, Pressable, Linking, Platform } from "react-native";

export default function GpsDisabledModal() {
  const openGpsSettings = () => {
    if (Platform.OS === "android") {
      Linking.openSettings();
    } else {
      Linking.openURL("app-settings");
    }
  }

  return (
    <Modal transparent animationType="fade">
      <View className="flex-1 bg-black/50 items-center justify-center px-6">
        <View className="w-full bg-white p-6 items-center justify-center gap-3 rounded-xl">
          <Image className="w-24 h-24" source={require("@/assets/user/map/alert.png")} />
          <Text className="font-itim text-3xl text-yellow-500">ATENÇÂO!</Text>
            
          <Text className="text-center font-itim text-lg">Parece que você está com o GPS desativado... Ative-o para ter uma melhor experiência no aplicativo. (Caso o GPS já esteja ativado, aguarde um momento para que essa janela seja minimizada)</Text>
          <Pressable onPress={openGpsSettings} className="bg-[#EAAA6A] w-full p-4 items-center justify-center rounded-lg active:opacity-65">
            <Text className="text-xl font-itim text-center">Ir até as configurações</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}