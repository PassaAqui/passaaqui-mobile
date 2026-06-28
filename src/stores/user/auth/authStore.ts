import { create } from "zustand";
import * as SecureStore from "expo-secure-store";

const REFRESH_TOKEN = "refresh_token";

interface AuthState {
  accessToken: string | null,
  setAccessToken: (token: string) => void,
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,

  setAccessToken: (token) => set({ accessToken: token }),
  
  logout: async () => {
    await SecureStore.deleteItemAsync(REFRESH_TOKEN);
    set({ accessToken: null });
  },
}));