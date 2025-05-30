import { create } from "zustand";
import { persist } from "zustand/middleware";
import UserService from "../services/UserService";

interface User {
  id: number;
  email: string;
  username: string;
  created_at: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  login:  (email: string, password: string) => Promise<void>;
  register:(email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user:  null,
      token: null,

      /* ─── Login ────────────────────────────── */
      login: async (email, password) => {
        const { data } = await UserService.login({ email, password });
        const { token, user } = data;

        localStorage.setItem("token", token);
        set({ user, token });
      },

      /* ─── Register ─────────────────────────── */
      register: async (email, password) => {
        const username = email.split("@")[0];       // simple username rule
        const { data } = await UserService.createUser({ email, password, username });
        const { token, user } = data;

        localStorage.setItem("token", token);
        set({ user, token });
      },

      /* ─── Logout ───────────────────────────── */
      logout: () => {
        localStorage.removeItem("token");
        set({ user: null, token: null });
      },
    }),
    { name: "auth-storage" } // localStorage key
  )
);
