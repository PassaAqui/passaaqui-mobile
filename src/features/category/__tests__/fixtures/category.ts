import type { CategoryProduct } from "@/src/features/category/services/categoryService";

export const categories = [
  {
    id: 3,
    name: "Café",
    description: "Cafés especiais",
  },
  {
    id: 5,
    name: "Artesanato",
    description: "Peças artesanais do Recife",
  },
];

export const rawCategoryProducts = {
  id: 3,
  name: "Café",
  description: "Cafés especiais",
  products: {
    content: [
      {
        id: 2,
        name: "Capuccino especial",
        description: "Capuccino com canela",
        price: 15.9,
        maxXp: 20,
        stock: 8,
        image: "https://cdn.example.com/capuccino.jpg",
        averageRating: 4.9,
        ratingsCount: 60,
        shopkeeper: { id: 2, name: "Café do Recife" },
        category: { id: 3, name: "Café" },
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
      {
        id: 3,
        name: "Caneca personalizada",
        description: "Caneca de cerâmica",
        price: 45.0,
        maxXp: 40,
        stock: 3,
        image: null,
        averageRating: 4.5,
        ratingsCount: 18,
        shopkeeper: { id: 2, name: "Café do Recife" },
        category: { id: 3, name: "Café" },
        createdAt: "2026-01-02T00:00:00.000Z",
        updatedAt: "2026-01-02T00:00:00.000Z",
      },
    ],
    totalElements: 2,
    totalPages: 1,
    number: 0,
    size: 20,
    first: true,
    last: true,
  },
};

export const categoryProductsWithImages = {
  id: 3,
  name: "Café",
  description: "Cafés especiais",
  products: {
    content: [
      {
        id: 2,
        name: "Capuccino especial",
        description: "Capuccino com canela",
        price: 15.9,
        maxXp: 20,
        stock: 8,
        image: "https://cdn.example.com/capuccino.jpg",
        images: ["https://cdn.example.com/capuccino.jpg"],
        averageRating: 4.9,
        ratingsCount: 60,
        shopkeeper: { id: 2, name: "Café do Recife" },
        category: { id: 3, name: "Café" },
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
      {
        id: 3,
        name: "Caneca personalizada",
        description: "Caneca de cerâmica",
        price: 45.0,
        maxXp: 40,
        stock: 3,
        image: null,
        images: [],
        averageRating: 4.5,
        ratingsCount: 18,
        shopkeeper: { id: 2, name: "Café do Recife" },
        category: { id: 3, name: "Café" },
        createdAt: "2026-01-02T00:00:00.000Z",
        updatedAt: "2026-01-02T00:00:00.000Z",
      },
    ] as CategoryProduct[],
    totalElements: 2,
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