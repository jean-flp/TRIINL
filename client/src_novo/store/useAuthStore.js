import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  setUser: (userData) => set({ user: userData }),
  logout: () => set({ user: null }),
}));
