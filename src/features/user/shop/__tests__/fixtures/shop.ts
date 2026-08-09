import type {
  ProductDetail,
  Products,
} from "@/src/features/user/shop/services/productService";
import type { CategoryProduct } from "@/src/features/category/services/categoryService";

export const products: Products[] = [
  {
    id: 1,
    images: ["https://cdn.example.com/cafe.jpg"],
    name: "Café especial",
    description: "Café torrado artesanalmente",
    price: 19.9,
    maxXp: 30,
    stock: 10,
    shopkeeperId: 2,
    categoryId: 3,
  },
];

export const productDetail: ProductDetail = {
  id: 1,
  images: ["https://cdn.example.com/cafe.jpg"],
  name: "Café especial",
  description: "Café torrado artesanalmente",
  price: 19.9,
  maxXp: 30,
  stock: 10,
  averageRating: 4.8,
  ratingsCount: 120,
  poi: {
    id: 7,
    name: "Marco Zero",
    latitude: -8.0632,
    longitude: -34.8711,
    city: {
      id: 9,
      microRegion: "Recife",
      state: "PE",
    },
  },
  shopkeeper: {
    id: 2,
    name: "Café do Recife",
  },
  category: {
    id: 3,
    name: "Café",
  },
};

export const categoryProduct: CategoryProduct = {
  id: 1,
  name: "Café especial",
  description: "Café torrado artesanalmente",
  price: 19.9,
  maxXp: 30,
  stock: 10,
  images: ["https://cdn.example.com/cafe.jpg"],
  averageRating: 4.8,
  ratingsCount: 120,
  shopkeeper: { id: 2, name: "Café do Recife" },
  category: { id: 3, name: "Café" },
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

export const categoryProducts = {
  id: 3,
  name: "Café",
  description: "Cafés especiais",
  products: {
    content: [categoryProduct],
    totalElements: 1,
    totalPages: 1,
    number: 0,
    size: 20,
    first: true,
    last: true,
  },
};

export function createAxiosError(status: number) {
  const error = new Error("Request failed") as Error & {
    isAxiosError: boolean;
    response: { status: number; data: unknown };
  };

  error.isAxiosError = true;
  error.response = { status, data: {} };

  return error;
}
