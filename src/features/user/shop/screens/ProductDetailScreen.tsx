import { ScrollView, View, Image, Text, Pressable } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import XpBar from "@/src/features/user/shop/components/XpBar";
import CompleteRequiredXp from "@/src/features/user/shop/components/CompleteRequiredXp";
import StarRating from "@/src/features/user/shop/components/StarRating";
import { useRedemptionCheck } from "@/src/hooks/user/map/shop/useRedemptionCheck";
import RedemptionAlertModal from "@/src/features/user/shop/components/RedemptionAlertModal";
import Header from "@/src/features/user/shop/components/Header";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTouristMe } from "@/src/features/user/auth/hooks/useTouristMe";
import { useProductDetail } from "@/src/features/user/shop/hooks/products/useProductDetail";
import { ProductImageCarousel } from "@/src/features/user/shop/components/ProductImageCarousel";

const discount = 5.00;

export default function ProductDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { hasRedeemed, setRedeemed } = useRedemptionCheck();

  const { data: user } = useTouristMe();

  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: product } = useProductDetail(Number(id));

  if (!product) return null;

  const canRescue = (user?.currentXP ?? 0) >= Number(product.maxXp);

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-white">
      <Header />

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}>
        <View className="items-center justify-center p-6 gap-5">
          <View className="w-full relative overflow-hidden">
            <ProductImageCarousel images={product.images ?? []} />
            <View className="absolute bottom-3 right-3 bg-[#3D2408] px-3 p-1 flex-row rounded-full gap-1 items-center justify-center">
              <Image className={canRescue ? "w-5 h-5" : "w-6 h-6"} source={canRescue ? require("@/assets/user/map/poi/shop/coin.png") : require("@/assets/user/map/poi/shop/no-coin.png")} />
              <Text className="text-white text-sm text-center font-interBold">
                R$ {product.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </Text>
            </View>
          </View>

          <View className="flex-row justify-between w-full px-3">
            <View className="flex-1">
              <Text className="text-2xl font-interBold">{product.name}</Text>
              <Text className="opacity-55 font-inter">{product.poi.name + " - " + product.poi.city.microRegion + " " + product.poi.city.state}</Text>

              <View className="flex-row gap-1 items-center">
                <StarRating rating={product.averageRating ?? 0} />
                <Text className="opacity-55 font-inter">{product.averageRating ?? 0} ({product.ratingsCount} avaliações)</Text>
              </View>
            </View>

            <View className={`${canRescue ? 'bg-[#EAAA6A]' : 'bg-[#F0EEEA] border border-gray-300'} items-center justify-center p-2 px-4 rounded-3xl self-start shrink-0`}>
              <Text className={`${canRescue ? 'text-white' : 'text-black'} font-inter uppercase`} numberOfLines={1}>{product.category.name}</Text>
            </View>
          </View>

          <View className="gap-5 w-full">
            <View className="border-2 border-[#EAAA6A] rounded-2xl px-4 py-5 gap-2">
              <Text className="text-lg font-interBold" adjustsFontSizeToFit>SOBRE O PRODUTO</Text>
              <Text className="text-justify opacity-70 font-inter" adjustsFontSizeToFit>{product.description}</Text>
            </View>

            <View className="border border-[#EAAA6A] rounded-2xl px-4 py-5 gap-2">
              <Text className="text-lg font-interBold" adjustsFontSizeToFit>DETALHES DO DESCONTO</Text>
              <View className="justify-between flex-row flex-wrap">
                <Text className="opacity-70 font-inter" adjustsFontSizeToFit>Valor do desconto</Text>
                <Text className="text-green-700 font-interBold"  adjustsFontSizeToFit>- R$ {discount.toLocaleString("pt-br", {minimumFractionDigits: 2, maximumFractionDigits: 2})}</Text>
              </View>

              <View className="justify-between flex-row flex-wrap">
                <Text className="opacity-70 font-inter" adjustsFontSizeToFit>Validade</Text>
                <Text className="font-inter" adjustsFontSizeToFit>30 dias após o resgate</Text>
              </View>

              <View className="justify-between flex-row flex-wrap">
                <Text className="opacity-70 font-inter" adjustsFontSizeToFit>Uso</Text>
                <Text className="font-inter" adjustsFontSizeToFit>1 vez por resgate</Text>
              </View>
            </View>

            <View className={`${canRescue ? 'bg-[#E0DBD5]' : 'bg-[#FFF3F3]'} border ${canRescue ? 'border-gray-300' : 'border-[#F5C0C0]'} rounded-2xl px-4 py-5 flex-col gap-2`}>
              <View className="flex-row justify-between flex-wrap">
                <Text className="text-lg flex-1 font-interBold" adjustsFontSizeToFit>SEU PROGRESSO</Text>
                <View className="flex-row gap-1 items-center justify-center shrink-0">
                  <Image className="w-6 h-6" source={require("@/assets/user/map/poi/shop/coin.png")} />
                  <Text className="text-[#A86830] font-interBold" adjustsFontSizeToFit>{user?.currentXP ?? 0} / {product.maxXp} XP</Text>
                </View>
              </View>

              <XpBar currentXp={user?.currentXP ?? 0} xpRequired={Number(product.maxXp)} thickness={3}/>

              <View className="flex-row gap-2 items-center">
                <CompleteRequiredXp currentXp={user?.currentXP ?? 0} requiredXp={Number(product.maxXp)} showText={true} />
              </View>
            </View>
          </View>

          <View className="w-full items-center justify-center gap-2 shrink-0">
            <Pressable
              onPress={!canRescue
                ? () => setRedeemed(true)
                : () => router.push({
                  pathname: "/user/(private)/payment",
                  params: { id: product.id, discount }
                })}
              disabled={!canRescue}
              className={`${canRescue ? 'bg-[#EAAA6A]' : 'bg-[#888888]'} w-full p-4 items-center rounded-xl active:opacity-55`}
            >
              <Text className="text-white text-lg font-interBold">Resgatar</Text>
            </Pressable>

            <Text className={`text-sm text-center ${canRescue ? 'opacity-55' : 'text-red-500'} font-inter`}>
              {canRescue 
                ? `Ao resgatar, ${product.maxXp} XP serão debitados do seu saldo`
                : `Você precisa de mais ${Number(product.maxXp) - (user?.currentXP ?? 0)} XP para resgatar esse item`
              }
            </Text>
          </View>
        </View>
      </ScrollView>

      {hasRedeemed && (
        <RedemptionAlertModal img={product.images?.[0] ?? null} title={product.name} discount={discount} visible={hasRedeemed} onClose={() => setRedeemed(false)} />
      )}
    </SafeAreaView>
  )
}