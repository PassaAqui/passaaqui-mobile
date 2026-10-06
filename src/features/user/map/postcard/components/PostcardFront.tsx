import { View, Image, Text } from "react-native";

interface PostcardFrontProps {
  cityImage: string;
  cityName: string;
}

export default function PostcardFront({ cityImage, cityName }: PostcardFrontProps) {
  return (
    <View className="w-full h-full bg-[#F4F1EA] rounded-2xl p-3 shadow-lg">
      <View className="flex-1 rounded-xl overflow-hidden">
        <Image source={{ uri: cityImage }} className="w-full h-full" resizeMode="cover" />

        <View className="absolute bottom-0 left-0 right-0 bg-black/40 py-4 items-center">
          <Text className="text-white font-inter text-2xl tracking-widest uppercase">{cityName}</Text>
        </View>
      </View>
    </View>
  );
}