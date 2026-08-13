import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { destroyEncryptionKey, secureStorage } from "./secureStorage";

export type AuthUser = {
  id: number;
  email: string;
  role: string;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
};

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  deviceId: string | null;
  hasHydrated: boolean;

  setAuth: (
    user: AuthUser,
    token: string,
    refreshToken: string,
    deviceId: string
  ) => void;
  setTokens: (token: string, refreshToken: string) => void;
  logout: (redirect?: boolean) => void;
  setHasHydrated: (value: boolean) => void;
};

const LEGACY_KEYS = ["token", "auth", "auth-storage", "deviceId"];

const STORAGE_KEY = "auth-storage";

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      deviceId: null,
      hasHydrated: false,

      setAuth: (user, token, refreshToken, deviceId) =>
        set({ user, token, refreshToken, deviceId }),

      setTokens: (token, refreshToken) => set({ token, refreshToken }),

      logout: (redirect = true) => {
        set({ user: null, token: null, refreshToken: null, deviceId: null });

        if (typeof window === "undefined") return;

        for (const key of LEGACY_KEYS) localStorage.removeItem(key);
        localStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem(STORAGE_KEY);

        void destroyEncryptionKey();

        if (redirect) window.location.href = "/login";
      },

      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => secureStorage),

      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        deviceId: state.deviceId,
      }),

      version: 2,
      migrate: () => ({
        user: null,
        token: null,
        refreshToken: null,
        deviceId: null,
      }),

      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.warn("[auth] Failed to restore session; starting signed out.", error);
        }
        (state ?? useAuthStore.getState()).setHasHydrated(true);
      },
    }
  )
);
