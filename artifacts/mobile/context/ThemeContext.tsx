import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Platform, useColorScheme } from "react-native";
import * as SecureStore from "expo-secure-store";

export type ThemePreference = "system" | "light" | "dark";

const THEME_KEY = "nexus_theme_pref";

async function storeTheme(t: ThemePreference) {
  if (Platform.OS === "web") localStorage.setItem(THEME_KEY, t);
  else await SecureStore.setItemAsync(THEME_KEY, t);
}

async function loadTheme(): Promise<ThemePreference> {
  try {
    const v =
      Platform.OS === "web"
        ? localStorage.getItem(THEME_KEY)
        : await SecureStore.getItemAsync(THEME_KEY);
    if (v === "light" || v === "dark" || v === "system") return v;
  } catch {}
  return "dark";
}

interface ThemeContextValue {
  preference: ThemePreference;
  isDark: boolean;
  setPreference: (p: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  preference: "dark",
  isDark: true,
  setPreference: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>("dark");

  useEffect(() => {
    loadTheme().then(setPreferenceState);
  }, []);

  const setPreference = useCallback((p: ThemePreference) => {
    setPreferenceState(p);
    storeTheme(p).catch(() => {});
  }, []);

  const isDark =
    preference === "system" ? system !== "light" : preference !== "light";

  return (
    <ThemeContext.Provider value={{ preference, isDark, setPreference }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
