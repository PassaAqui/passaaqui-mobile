import { Text, View, ImageBackground, Image, ScrollView } from "react-native";
import { Redirect, Link } from "expo-router"

export default function Index() {

  // Apenas em desenvolvimento para testar novas telas
  return <Redirect href={"/user/map"} />

  return (
    <ImageBackground
      source={{ uri: "https://www.voelivre.com.br/wp-content/uploads/2025/03/adobestock_515087389Reduzi.jpg" }}
      className="flex-1"
      resizeMode="cover"
    >
      <ScrollView>
        <View className="justify-center items-center bg-black/40 h-screen p-10">
          <View className="mb-7">
            <Image className="w-40 h-40" source={require("@/assets/logo/logo.png")} />
          </View>

          <View className="justify-center mb-16 gap-3 w-full">
            <Text className="text-white text-6xl text-center font-irishGrover">Recife GO</Text>
            <Text className="text-white text-center font-irishGrover self-center max-w-56">Transforme a cidade em uma aventura</Text>
          </View>

          <View className="w-full gap-6">
            <View className="gap-6">
              <Link href={"/user/auth/login"} className="border-[#EAAA6A] border-2 p-3 rounded-3xl items-center active:opacity-50">
                <Text className="font-itim text-lg text-center text-white">Continuar como aventureiro</Text>
              </Link>
      
              <View className="flex-row justify-center items-center gap-3">
                <View className="w-1/3 h-px bg-white" />
                <Text className="text-white font-itim">Ou</Text>
                <View className="w-1/3 h-px bg-white" />
              </View>

              <Link href={"/shopkeeper/signup"} className="bg-white p-3 rounded-3xl items-center flex-row gap-2 justify-center active:opacity-70">
                <Text className="font-itim text-lg text-center">Contiuar como comerciante</Text>
              </Link>
            </View>

          </View>
        </View>
      </ScrollView>

    </ImageBackground>
  );
}
