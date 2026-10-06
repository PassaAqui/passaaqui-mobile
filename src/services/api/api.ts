import axios, { create } from "axios";
import * as SecureStore from "expo-secure-store";
import { useAuthStore } from "@/src/stores/user/auth/authStore";
import { useShopkeeperAuthStore } from "@/src/stores/shopkeeper/auth/shopkeeperAuthStore";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const api = create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" }
})

api.interceptors.request.use((config) => {
  if (!config.headers.Authorization) {
    const touristToken = useAuthStore.getState().accessToken;
    const shopkeeperToken = useShopkeeperAuthStore.getState().accessToken;
    const token = touristToken ?? shopkeeperToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

let lastRefreshTime = 0;

async function refreshAccessToken(): Promise<string> {
  const now = Date.now();
  if (now - lastRefreshTime < 5000) throw new Error("Refresh too frequent");
  lastRefreshTime = now;

  const touristRefresh = await SecureStore.getItemAsync("refresh_token");
  const shopkeeperRefresh = await SecureStore.getItemAsync("shopkeeper_refresh_token");
  const refreshToken = touristRefresh ?? shopkeeperRefresh;
  const isTourist = !!touristRefresh;

  if (!refreshToken) throw new Error("sem refresh token");

  const { data } = await axios.get(`${BASE_URL}/auth/refresh`, {
    headers: { Authorization: `Bearer ${refreshToken}` },
  });

  const key = isTourist ? "refresh_token" : "shopkeeper_refresh_token";
  await SecureStore.setItemAsync(key, data.refresh_token);

  if (isTourist) {
    useAuthStore.getState().setAccessToken(data.access_token);
  } else {
    useShopkeeperAuthStore.getState().setAccessToken(data.access_token);
  }

  return data.access_token;
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const newToken = await refreshAccessToken();
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        const isTourist = !!(await SecureStore.getItemAsync("refresh_token"));
        if (isTourist) {
          await useAuthStore.getState().logout();
        } else {
          await useShopkeeperAuthStore.getState().logout();
        }
        return Promise.reject(error);
      }
    }

    if (error.response?.status === 401 && original._retry) {
      await useAuthStore.getState().logout();
      return Promise.reject(new Error("Sessão expirada, faça login novamente"));
    }

    return Promise.reject(error);
  }
);

/*
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null;
          })
        }

        const newAccessToken = await refreshPromise;
        original.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(original);
      } catch(refreshError) {
        console.log("[api.ts] refresh falhou, fazendo logout:", refreshError);
        await useAuthStore.getState().logout();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
)
*/
