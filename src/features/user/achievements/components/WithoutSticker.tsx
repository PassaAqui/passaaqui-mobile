import { Pressable, Image, Text } from "react-native";

// Máximo de caracteres exibidos na descrição, já contando as reticências.
export const MAX_DESCRIPTION_LENGTH = 60;

export function truncateDescription(description: string) {
  const normalized = description.replace(/\s+/g, " ").trim();

  if (normalized.length <= MAX_DESCRIPTION_LENGTH) {
    return normalized;
  }

  const sliced = normalized.slice(0, MAX_DESCRIPTION_LENGTH - 3);
  const lastSpace = sliced.lastIndexOf(" ");
  const cut = (lastSpace > 0 ? sliced.slice(0, lastSpace) : sliced).trimEnd();

  return `${cut}...`;
}

interface WithoutStickerProps {
  title: string,
  description: string,
}

export default function WithoutSticker({ title, description }: WithoutStickerProps) {
  return (
    <Pressable className="border-2 border-dashed border-gray-400/60 rounded-xl items-center justify-center overflow-hidden h-60 w-full xs:w-[47%] max-w-[240px] px-2.5 py-4 active:opacity-45">
      <Image className="w-full flex-1 min-h-[96px] opacity-55" source={require("@/assets/user/achievements/without-sticker.png")} resizeMode="contain" />
      <Text className="font-interBold text-lg text-center w-full" numberOfLines={2} ellipsizeMode="tail">{title}</Text>
      <Text className="text-sm font-inter opacity-65 text-center w-full" numberOfLines={2} ellipsizeMode="tail">{truncateDescription(description)}</Text>
    </Pressable>
  )
}
