import { create } from "zustand";

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

export const useAuthStore = create<AuthState>((set) => ({
  user: {
    id: "1",
    name: "Udayraj Sahu",
    email: "user@examarena.com",
    role: "Champion",
  },
  token: null,
  isAuthenticated: true,
  isOnboarded: true,

  login: async (_email: string, _password: string) => {
    set({
      user: { id: "1", name: "Udayraj Sahu", email: _email, role: "Champion" },
      token: "mock-jwt-token",
      isAuthenticated: true,
    });
  },

  logout: () => {
    set({ user: null, token: null, isAuthenticated: false });
  },

  setToken: (token: string | null) => {
    set({ token, isAuthenticated: !!token });
  },

  completeOnboarding: () => {
    set({ isOnboarded: true });
  },
}));
