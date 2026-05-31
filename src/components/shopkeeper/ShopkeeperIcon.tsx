import { View, Image } from "react-native";

export default function ShopkeeperIcon() {
    return (
        <View>
            <Image className="w-36 h-36 rounded-full" source={require("@/assets/shopkeeper/auth/shopkeeper.png")} />
        </View>
    )
}