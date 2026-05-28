import { Pressable, Image, Text } from "react-native"

export default function CompleteSticker() {
  return (
    <Pressable className="gap-2 border border-gray-400 rounded-xl items-center justify-center overflow-hidden min-h-52 w-[47%] pb-6 active:opacity-55">
      <Image className="bg-gray-400 w-full h-40" source={{ uri: "https://www.gov.br/turismo/pt-br/assuntos/noticias/historia-e-natureza-no-passeio-pelo-rio-timbo-em-paulista-pe/29.08.22_PaulistsPECarlosQueiroz.jpg/@@images/812978df-6147-41ad-98fa-533fc4145042.jpeg" }} />
      <Text className="font-interBold text-lg text-center">Rio Timbó</Text>
    </Pressable>
  )
}