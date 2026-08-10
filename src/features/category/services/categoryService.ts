import { api } from "@/src/services/api/api";

export interface CategoryResponse {
  id: number;
  name: string;
  description: string;
}

export interface RawCategoryProduct {
  id: number;
  name: string;
  description: string | null;
  price: number;
  maxXp: number | null;
  stock: number;
  image: string | null;
  averageRating: number | null;
  ratingsCount: number | null;
  shopkeeper: { id: number; name: string };
  category: { id: number; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface CategoryProduct {
  id: number;
  name: string;
  description: string | null;
  price: number;
  maxXp: number | null;
  stock: number;
  images: string[];
  averageRating: number | null;
  ratingsCount: number | null;
  shopkeeper: { id: number; name: string };
  category: { id: number; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface CategoryWithProducts {
  id: number;
  name: string;
  description: string;
  products: {
    content: CategoryProduct[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
    first: boolean;
    last: boolean;
  };
}

export interface RawCategoryWithProducts {
  id: number;
  name: string;
  description: string;
  products: {
    content: RawCategoryProduct[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
    first: boolean;
    last: boolean;
  };
}

export async function getAllCategories(): Promise<CategoryResponse[]> {
  const { data } = await api.get<CategoryResponse[]>("/categories");
  return data;
}

export async function getCategoryById(id: number, page = 0, size = 20): Promise<CategoryWithProducts> {
  const { data } = await api.get<RawCategoryWithProducts>(`/categories/${id}`, {
    params: { page, size },
  });

  return {
    ...data,
    products: {
      ...data.products,
      content: data.products.content.map((product) => ({
        ...product,
        images: product.image ? [product.image] : [],
      })),
    },
  };
}