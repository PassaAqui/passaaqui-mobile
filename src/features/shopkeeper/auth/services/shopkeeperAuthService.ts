import * as SecureStore from "expo-secure-store";
import { api } from "@/src/services/api/api";
import { useShopkeeperAuthStore } from "@/src/stores/shopkeeper/auth/shopkeeperAuthStore";
import axios from "axios";

const REFRESH_TOKEN = "shopkeeper_refresh_token";
const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

interface LoginData {
  email: string;
  password: string;
}

async function saveTokens(accessToken: string, refreshToken: string) {
  useShopkeeperAuthStore.getState().setAccessToken(accessToken);
  await SecureStore.setItemAsync(REFRESH_TOKEN, refreshToken);
}

export async function signUpShopkeeper(formData: FormData) {
  await api.post("/auth/register/shopkeeper", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export async function loginShopkeeper({ email, password }: LoginData) {
  const { data } = await api.post("/auth/login", { email, password });
  await saveTokens(data.access_token, data.refresh_token);
}

export async function logoutShopkeeper() {
  try {
    const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN);
    if (refreshToken) {
      await axios.get(`${BASE_URL}/auth/logout`, {
        headers: { Authorization: `Bearer ${refreshToken}` },
      });
    }
  } catch {
  } finally {
    await useShopkeeperAuthStore.getState().logout();
  }
}

export async function tryRestoreShopkeeperSession(): Promise<boolean> {
  try {
    const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN);
    console.log("[restore] refresh token do LOJISTA no SecureStore:", refreshToken ? "existe" : "não existe");
    if (!refreshToken) return false;

    console.log("[restore] enviando refresh token do LOJISTA:", `refresh_token=${refreshToken}`);
    const { data } = await axios.get(`${BASE_URL}/auth/refresh`, {
      headers: { Authorization: `Bearer ${refreshToken}` },
    });

    useShopkeeperAuthStore.getState().setAccessToken(data.access_token);
    await SecureStore.setItemAsync(REFRESH_TOKEN, data.refresh_token);
    return true;
  } catch (error) {
    if (axios.isAxiosError(error) && (error.response?.status === 400 || error.response?.status === 401)) {
      await useShopkeeperAuthStore.getState().logout();
    }
    return false;
  }
}