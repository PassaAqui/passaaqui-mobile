import { View, Image, Text, ScrollView, Pressable } from "react-native";

interface PostcardBackProps {
  cityImage: string;
  cityName: string;
  chronicle: string;
  onFlip?: () => void;
}

export default function PostcardBack({ cityImage, cityName, chronicle, onFlip }: PostcardBackProps) {
  return (
    <View className="w-full h-full bg-[#F4F1EA] rounded-2xl p-3 shadow-lg">
      <Pressable onPress={onFlip} className="flex-1">
        <View className="pb-3">
          <Text className="font-itim text-xs text-gray-500 uppercase tracking-widest">POSTAL DA CIDADE</Text>
          <Text className="font-itim text-lg text-gray-800 uppercase">{cityName}</Text>
        </View>

        <View className="flex-1 overflow-hidden">
          <Image source={{ uri: cityImage }} className="w-full h-full" resizeMode="cover" />
        </View>
      </Pressable>

      <View className="items-center justify-center">
        <View className="h-[1px] w-[85%] bg-gray-500 my-4" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        className="flex-1"
        contentContainerClassName="grow items-center px-5 pb-4"
      >
        <Text className="font-interItalic text-sm text-gray-700 leading-7 text-center">{chronicle}</Text>
      </ScrollView>
    </View>
  );
}
