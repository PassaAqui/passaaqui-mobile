import * as SecureStore from "expo-secure-store";
import { api } from "@/src/services/api/api";
import { useAuthStore } from "@/src/stores/user/auth/authStore";
import axios from "axios";

const REFRESH_TOKEN = "refresh_token";

interface SingUpData {
  email: string,
  name: string,
  password: string,
  confirm_password: string,
  cpf: string
}

interface LoginData {
  email: string,
  password: string
}

async function saveTokens(accessToken: string, refreshToken: string) {
  useAuthStore.getState().setAccessToken(accessToken);
  await SecureStore.setItemAsync(REFRESH_TOKEN, refreshToken);
}

export async function singUp(data: SingUpData) {
  await api.post("/auth/register/tourist", {
    ...data,
    documentId: data.cpf.replace(/\D/g, ""), // tira os "." e o "-" do CPF digitado pelo usuario
    cpf: undefined
  });

  await login({ email: data.email, password: data.password });
}

export async function login({email, password }: LoginData) {
  const { data } = await api.post("/auth/login", { email, password });
  await saveTokens(data.access_token, data.refresh_token);
}

export async function logout() {
  try {
    const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN);
    if (refreshToken) {
      await api.get("/auth/logout", {
        headers: {
          Cookie: `refresh_token=${refreshToken}`
        }
      })
    }
  } catch {
  } finally {
    await useAuthStore.getState().logout();
  }
}

export async function  tryRestoreSession(): Promise<boolean> {
  try {
    const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN);
    console.log("[restore] refresh token no SecureStore:", refreshToken ? "existe" : "não existe");
    if (!refreshToken) return false;

    console.log("[restore] enviando refresh token:", `refresh_token=${refreshToken}`);
    const { data } = await api.get("/auth/refresh", {
      headers: {
        withCredentials: true,
        Cookie: `refresh_token=${refreshToken}`
      }
    });

    console.log("[restore] resposta do backend:", data);
    useAuthStore.getState().setAccessToken(data.access_token);

    if (data.refresh_token) {
      await SecureStore.setItemAsync(REFRESH_TOKEN, data.refresh_token);
    }

    return true;
  } catch (error) {
    console.log("[restore] erro:", error);

    if (axios.isAxiosError(error)) {
      console.log("[restore] status:", error.response?.status);
      console.log("[restore] body:", error.response?.data);
    }

    if (axios.isAxiosError(error) && (error.response?.status === 400 || error.response?.status === 401)) {
      await logout();
    }
    
    return false;
  }
}