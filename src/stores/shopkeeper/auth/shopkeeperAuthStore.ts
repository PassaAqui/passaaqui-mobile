import { create } from "zustand";
import * as SecureStore from "expo-secure-store";

const REFRESH_TOKEN = "shopkeeper_refresh_token";

interface ShopkeeperAuthState {
  accessToken: string | null;
  setAccessToken: (token: string) => void;
  logout: () => Promise<void>;
}

export const useShopkeeperAuthStore = create<ShopkeeperAuthState>((set) => ({
  accessToken: null,

  setAccessToken: (token) => set({ accessToken: token }),

  logout: async () => {
    await SecureStore.deleteItemAsync(REFRESH_TOKEN);
    set({ accessToken: null });
  },
}));