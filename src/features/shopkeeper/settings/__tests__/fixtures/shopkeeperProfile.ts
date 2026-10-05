import type { ShopkeeperMe } from "@/src/features/shopkeeper/auth/services/shopkeeperService";

export const STORE_IMAGE_URL =
  "http://localhost:9000/passaaqui-bucket/pois/store-10.jpg";
export const UPDATED_STORE_IMAGE_URL =
  "http://localhost:9000/passaaqui-bucket/pois/logo-novo.jpg";
export const SHOPKEEPER_AVATAR_URL =
  "http://localhost:9000/passaaqui-bucket/users/avatar-2.jpg";

export const shopkeeperProfile: ShopkeeperMe = {
  id: 2,
  email: "lojista@email.com",
  name: "Maria Lojista",
  documentId: "11222333000181",
  companyName: "Maria's Comércio",
  description: "Loja de artesanato local",
  image: SHOPKEEPER_AVATAR_URL,
  theme: "LIGHT",
  category: {
    id: 1,
    name: "Alimentação",
    description: "Restaurantes, lanchonetes e food trucks",
  },
  poi: {
    id: 10,
    name: "Store POI",
    description: "Loja de artesanato no centro",
    imageUrl: STORE_IMAGE_URL,
    type: "STORE",
    latitude: -23.5,
    longitude: -46.6,
    city: { id: 1, name: "São Paulo" },
  },
  createdAt: "2026-05-24T10:01:00",
  updatedAt: "2026-05-24T10:01:00",
};

export const updatedShopkeeperProfile: ShopkeeperMe = {
  ...shopkeeperProfile,
  name: "Maria Lojista Atualizada",
  companyName: "Maria Artesanatos LTDA",
  description: "Loja especializada em bordados e cerâmica regional",
  theme: "DARK",
  poi: {
    ...shopkeeperProfile.poi,
    name: "Maria Artesanatos",
    description: "Loja especializada em bordados e cerâmica regional",
    imageUrl: UPDATED_STORE_IMAGE_URL,
  },
  updatedAt: "2026-05-24T12:00:00",
};

export const localStoreImageUri = "file:///var/mobile/loja-10.jpg";
export const localStoreImageFileName = "loja-10.jpg";

export function createAxiosError(status: number) {
  const error = new Error("Request failed") as Error & {
    isAxiosError: boolean;
    response: { status: number; data: unknown };
  };

  error.isAxiosError = true;
  error.response = { status, data: {} };

  return error;
}
