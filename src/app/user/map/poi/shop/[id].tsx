import { useLocalSearchParams } from "expo-router";
import ProductScreen from "@/src/app/user/map/poi/shop/product";
import { products } from "@/src/constants/user/map/poi/shop/products";

export default function Product() {
  const { id } = useLocalSearchParams();
  const product = products.find(p => p.id === Number(id));

  if (!product) return null;

  return (
    <ProductScreen
      img={product.img}
      title={product.title}
      requiredXp={product.xpRequired}
      location={product.location}
      description={product.description}
    />
  )
}