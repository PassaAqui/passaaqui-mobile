import { Text, View, ImageBackground, Image, Pressable, ScrollView } from "react-native";

export default function Index() {
  return (
    <ImageBackground
      source={{ uri: "https://www.voelivre.com.br/wp-content/uploads/2025/03/adobestock_515087389Reduzi.jpg" }}
      className="flex-1"
      resizeMode="cover"
    >
      <ScrollView>
        <View className="justify-center items-center bg-black/40 h-screen p-10">
          <View className="mb-7">
            <Image className="w-40 h-40" source={require("../../assets/logo/logo.png")} />
          </View>

          <View className="justify-center mb-14 gap-3">
            <Text className="text-white text-6xl text-center font-irishGrover">Recife GO</Text>
            <Text className="text-white text-center font-irishGrover">Transforme a cidade em uma aventura</Text>
          </View>

          <View className="w-full gap-6">
            <View className="gap-6">
              <Pressable className="bg-white p-4 rounded-2xl items-center">
                <Text className="font-itim text-lg">Cadastrar</Text>
              </Pressable>

              <Pressable className="bg-[#EAAA6A] p-4 rounded-2xl items-center">
                <Text className="font-itim text-lg">Entrar</Text>
              </Pressable>
            </View>

            <View className="flex-row justify-center items-center gap-3">
              <View className="w-32 h-px bg-white" />
              <Text className="text-white font-itim">Ou</Text>
              <View className="w-32 h-px bg-white" />
            </View>

            <Pressable className="bg-white p-4 rounded-2xl items-center flex-row gap-2 justify-center">
              <Image className="w-7 h-7 rounded-full" source={{ uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTXI-MAzeQW70mDdzZeOeDKlZTRSi43mhgpArfLMfF9g&s" }} />
              <Text className="font-itim text-lg">Contiuar com o Google</Text>
            </Pressable>

          </View>
        </View>
      </ScrollView>

    </ImageBackground>
  );
}
