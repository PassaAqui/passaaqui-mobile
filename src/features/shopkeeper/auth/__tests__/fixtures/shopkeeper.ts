import type { ShopkeeperMe } from "@/src/features/shopkeeper/auth/services/shopkeeperService";
import type { ShopkeeperSignUpData } from "@/src/features/shopkeeper/auth/schemas/signUpSchema";
import type { ExistingPoi } from "@/src/features/shopkeeper/auth/components/StoreLocationPickerModal";

export const SHOPKEEPER_REFRESH_TOKEN_KEY = "shopkeeper_refresh_token";
export const BASE_URL = "https://api.test.com";

export const existingShopPoi: ExistingPoi = {
  id: 1,
  name: "Café do Recife",
  latitude: -8.0675,
  longitude: -34.9167,
};

export const shopkeeperLoginInput = {
  email: "loja@email.com",
  password: "Senha@123",
};

export const validShopkeeperSignUpData: ShopkeeperSignUpData = {
  companyName: "Café do Recife",
  ownerName: "Maria Silva",
  email: "loja@email.com",
  documentId: "123.456.789-00",
  password: "Senha@123",
  confirmPassword: "Senha@123",
  category: "Cafeteria",
  cityId: 1,
  neighborhood: "Recife Antigo",
  street: "Rua do Bom Jesus",
  description: "Cafeteria no Recife Antigo",
  poiDescription: "Cafeteria no Marco Zero",
  image: "file:///img.jpg",
  location: {
    latitude: -8.0675,
    longitude: -34.9167,
  },
  terms: true,
};

export const shopkeeperTokens = {
  access_token: "access-token-jwt",
  refresh_token: "refresh-token-jwt",
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

export function createAxiosError(status: number) {
  const error = new Error("Request failed") as Error & {
    isAxiosError: boolean;
    response: { status: number; data: unknown };
  };

  error.isAxiosError = true;
  error.response = { status, data: {} };

  return error;
}