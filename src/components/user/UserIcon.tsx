import { View, Image } from "react-native";

export default function UserIcon() {
    return (
        <View>
            <Image className="w-36 h-36 rounded-full" source={require("@/assets/user/auth/user-2.png")} />
        </View>
    )
}