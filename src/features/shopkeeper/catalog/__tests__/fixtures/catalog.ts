import type {
  ShopkeeperProduct,
  ShopkeeperProductMetrics,
} from "@/src/features/shopkeeper/catalog/services/shopkeeperProductsService";

export const activeProductFood: ShopkeeperProduct = {
  id: 1,
  name: "Café especial",
  price: 19.9,
  image: "https://cdn.example.com/cafe.jpg",
  active: true,
  highlight: true,
  category: "Alimentação",
};

export const activeProductCraft: ShopkeeperProduct = {
  id: 2,
  name: "Boneco de barro",
  price: 25,
  image: null,
  active: true,
  highlight: false,
  category: "Artesanato",
};

export const inactiveProduct: ShopkeeperProduct = {
  id: 3,
  name: "Café desativado",
  price: 10,
  image: null,
  active: false,
  highlight: false,
  category: "Alimentação",
};

export const shopkeeperProducts: ShopkeeperProduct[] = [
  activeProductFood,
  activeProductCraft,
  inactiveProduct,
];

export const metrics: ShopkeeperProductMetrics = {
  total_products: 12,
  active_products: 10,
  highlight_products: 3,
};