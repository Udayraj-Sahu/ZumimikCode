import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setToken: (token: string | null) => void;
  completeOnboarding: () => void;
};

const IS_MOCK = process.env.NEXT_PUBLIC_API_MOCK !== "false";

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isOnboarded: false,

      login: async (email: string, _password: string) => {
        if (IS_MOCK) {
          await new Promise((r) => setTimeout(r, 300));
          set({
            user: { id: "1", name: email.split("@")[0], email, role: "Champion" },
            token: "mock-jwt-token",
            isAuthenticated: true,
          });
        } else {
          const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password: _password }),
          });
          if (!res.ok) throw new Error("Login failed");
          const data = await res.json();
          set({ user: data.user, token: data.token, isAuthenticated: true });
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },

      setToken: (token) => {
        set({ token, isAuthenticated: !!token });
      },

      completeOnboarding: () => {
        set({ isOnboarded: true });
      },
    }),
    {
      name: "exam-arena-auth",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : (undefined as unknown as Storage),
      ),
    },
  ),
);
