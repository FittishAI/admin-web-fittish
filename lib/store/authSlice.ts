// store/auth.ts
// store/auth.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

type AuthState = {
user: any | null;
token: string | null;
hasHydrated: boolean;
setAuth: (user: any, token: string) => void;
logout: () => void;
setHasHydrated: (v: boolean) => void;
};

export const useAuthStore = create<AuthState>()(
persist(
(set) => ({
    user: null,
    token: null,
    hasHydrated: false,
    setAuth: (user, token) => set({ user, token }),
    logout: () => {
    set({ user: null, token: null });
    if (typeof window !== "undefined") {
        localStorage.removeItem("auth");
        window.location.href = "/login";
    }
    },
    setHasHydrated: (v) => set({ hasHydrated: v }),
}),
{
    name: "auth-storage",
    onRehydrateStorage: () => (state) => {
    state?.setHasHydrated(true);
    },
}
)
);


//Incase of NO PERSIST CONFIGURATION
// export const useAuthStore = create<AuthState>((set) => ({
//   user: null,
//   token: null,
//   setAuth: (user, token) => set({ user, token }),
//   logout: () => set({ user: null, token: null }),
// }));
