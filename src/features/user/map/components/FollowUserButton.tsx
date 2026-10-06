import { Pressable, Text } from "react-native"

interface FollowUserButtonProps {
  onFollow: () => void;
}

export default function FollowUserButton({ onFollow }: FollowUserButtonProps) {
  return (
    <Pressable onPress={onFollow} className="w-1/4 bg-[#EAAA6A] rounded-lg py-1 items-center justify-center active:opacity-25">
      <Text className="font-itim text-lg text-white text-center" adjustsFontSizeToFit numberOfLines={1}>SEGUIR</Text>
    </Pressable>
  );
}