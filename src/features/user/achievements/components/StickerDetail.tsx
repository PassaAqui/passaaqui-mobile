import { Modal, View, Text, Image, Pressable, ScrollView } from "react-native";

interface StickerDetailProps {
  id: number,
  visible?: boolean,
  onClose?: () => void
}

// Implementar uma função pra buscar o Sticker com esse ID pra pegar os detalhes gerais dele

const product = {
  id: 1,
  complete: true,
  img: "https://www.gov.br/turismo/pt-br/assuntos/noticias/historia-e-natureza-no-passeio-pelo-rio-timbo-em-paulista-pe/29.08.22_PaulistsPECarlosQueiroz.jpg/@@images/812978df-6147-41ad-98fa-533fc4145042.jpeg",
  title: "Rio Timbó",
  description: "\"Uma iguaria digna da realeza, feita com a goma mais pura de Pernambuco e recheio de tradição.\"",
  origin: "Mercado São José",
  date: "01/01/2026",
  poi: "??????" // consultar quem fez o protótipo dessa tela oq é esse atributo
}

export default function StickerDetail({ id, visible, onClose }: StickerDetailProps) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <Pressable onPress={onClose} className="flex-1 bg-black/25 items-center justify-center px-6">
        <Pressable onPress={() => {}} className="w-full max-h-[90%] bg-[#F4F1EA] rounded-xl overflow-hidden shadow-lg shadow-black">
          <ScrollView showsVerticalScrollIndicator={false} className="bg-[#F4F1EA] rounded-xl" contentContainerStyle={{ overflow: 'hidden' }}>
            <Pressable onPress={onClose} className="pt-3 pl-3 self-start active:opacity-30">
              <Text className="font-inter text-lg text-start">← Voltar</Text>
            </Pressable>
            <Image className="bg-gray-200 w-full h-56 my-4" resizeMode="cover" source={{ uri: product.img }} />

            <View className="w-full px-6 pb-6 gap-4 items-center">
              <Text className="font-interBold text-3xl text-center" adjustsFontSizeToFit>{product.title}</Text>
              <Text className="font-interItalic text-center w-5/6 text-black/65">{product.description}</Text>

              <View className="flex flex-col border-2 border-dashed w-full p-4 border-gray-400/80 rounded-lg my-5">
                <View className="flex-row">
                  <Text className="flex-1">Origem:</Text>
                  <Text>{product.origin}</Text>
                </View>
                <View className="flex-row">
                  <Text className="flex-1">Data:</Text>
                  <Text>{product.date}</Text>
                </View>
                <View className="flex-row">
                  <Text className="flex-1">POI:</Text>
                  <Text>{product.poi}</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  )
}