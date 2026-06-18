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
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setToken: (token: string | null) => void;
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

  login: async (_email: string, _password: string) => {
    // Stub — real JWT flow added when backend exists
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
}));
