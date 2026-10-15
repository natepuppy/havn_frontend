import type { AppUser } from "@/typings";
import { getStorageItem, setStorageItem } from "@/utils/safeStorage";
import { create } from "zustand";

function readStoredUser(): AppUser | null {
  const raw = getStorageItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AppUser;
  } catch {
    return null;
  }
}

export type ThemeMode = "light" | "dark";

function readStoredTheme(): ThemeMode {
  return getStorageItem("theme") === "dark" ? "dark" : "light";
}

type GlobalState = {
  user: AppUser | null;
  setUser: (user: AppUser | null) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
};

const initialTheme = readStoredTheme();
if (typeof document !== "undefined") {
  document.documentElement.dataset.theme = initialTheme;
}

export const useGlobalStore = create<GlobalState>((set) => ({
  user: readStoredUser(),
  setUser: (user) => set({ user }),
  theme: initialTheme,
  setTheme: (theme) => {
    setStorageItem("theme", theme);
    document.documentElement.dataset.theme = theme;
    set({ theme });
  },
}));
