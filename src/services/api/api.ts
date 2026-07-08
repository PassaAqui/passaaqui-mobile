import axios from "axios";
import * as SecureStore from "expo-secure-store";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" }
})

api.interceptors.request.use((config) => {
  if (!config.headers.Authorization) {
    const token = useAuthStore.getState().accessToken;
    console.log("[api.ts] accessToken:", token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  console.log("[api.ts] request →", config.method?.toUpperCase(), config.url);
  return config;
})

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = await SecureStore.getItemAsync("refresh_token");
  if (!refreshToken) throw new Error("[api.ts AUTH ERROR]: refresh token nao existe");

  const { data } = await axios.get(`${BASE_URL}/auth/refresh`, {
    headers: {
      Authorization: `Bearer ${refreshToken}`
    }
  });

  useAuthStore.getState().setAccessToken(data.access_token);
  await SecureStore.setItemAsync("refresh_token", data.refresh_token);

  return data.access_token;
}

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

import { useAuthStore } from "@/src/stores/user/auth/authStore";