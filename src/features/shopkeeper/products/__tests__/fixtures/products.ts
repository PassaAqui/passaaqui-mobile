import type {
  CreateProductPayload,
  ProductModel,
  UpdateProductPayload,
} from "@/src/features/shopkeeper/products/services/productService";
import type { CreateProductFormValues } from "@/src/features/shopkeeper/products/schemas/createProductSchema";
import type { ShopkeeperMe } from "@/src/features/shopkeeper/auth/services/shopkeeperService";
import { createAxiosError } from "@/src/features/shopkeeper/auth/__tests__/fixtures/shopkeeper";

export { createAxiosError };

export const validCreateFormValues: CreateProductFormValues = {
  name: "Tapioca Clássica",
  category: { id: 3, name: "Café" },
  description: "Tapioca recheada com queijo coalho",
  price: 12.5,
  quantity: 10,
  images: [{ uri: "file:///tapioca.jpg", name: "tapioca.jpg" }],
};

export const validEditFormValues = {
  name: "Tapioca Clássica",
  category: { id: 3, name: "Café" },
  description: "Tapioca recheada com queijo coalho",
  price: 12.5,
  quantity: 10,
};

export const createProductPayload: CreateProductPayload = {
  name: "Tapioca Clássica",
  description: "Tapioca recheada com queijo coalho",
  price: 12.5,
  stock: 10,
  active: true,
  highlight: false,
  shopkeeperId: 1,
  categoryId: 3,
  poiId: 1,
};

export const productModel: ProductModel = {
  id: 5,
  name: "Tapioca Clássica",
  description: "Tapioca recheada com queijo coalho",
  price: 12.5,
  maxXp: 10,
  stock: 10,
  images: ["https://cdn.example.com/tapioca.jpg"],
  active: true,
  highlight: false,
  category: { id: 3, name: "Café" },
  image: "https://cdn.example.com/tapioca.jpg",
  shopkeeper: { id: 1, name: "Maria Silva", companyName: "Café do Recife" },
  poi: { id: 1, name: "Marco Zero", type: "monument" },
  createdAt: "2026-08-14T10:00:00Z",
  updatedAt: "2026-08-14T10:00:00Z",
};

export const updateProductPayload: UpdateProductPayload = {
  name: "Tapioca Clássica",
  description: "Tapioca recheada com queijo coalho",
  price: 15,
  stock: 8,
  active: true,
  highlight: true,
  categoryId: 3,
};

export const shopkeeperMe: ShopkeeperMe = {
  id: 1,
  email: "loja@email.com",
  name: "Maria Silva",
  companyName: "Café do Recife",
  description: "Cafeteria no Recife Antigo",
  category: { id: 1, name: "Cafeteria" },
  poi: { id: 1, name: "Marco Zero" },
};
