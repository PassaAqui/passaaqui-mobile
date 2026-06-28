import axios from "axios";
import * as SecureStore from "expo-secure-store";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" }
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;;

  return config;
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      try {
        const refreshToken = await SecureStore.getItemAsync("refresh_token");
        if (!refreshToken) throw new Error("[AUTH ERROR] - refresh token nao existe");

        const { data } = await axios.get(`${BASE_URL}/auth/refresh`, {
          headers: {
            Cookie: `refresh_token=${refreshToken}`
          }
        });

        useAuthStore.getState().setAccessToken(data.access_token);

        if (data.refresh_token) {
          await (SecureStore.setItemAsync("refresh_token", data.refresh_token));
        }
        
        original.headers.Authorization = `Bearer ${data.access_token}`;

        return api(original);
      } catch {
        await useAuthStore.getState().logout();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
)

import { useAuthStore } from "@/src/stores/user/auth/authStore";