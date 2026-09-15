import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";

const THEME_STORAGE_KEY = "@minhacifra/theme";

type ThemeContextType = {
  isDark: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext({} as ThemeContextType);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [savedTheme, setSavedTheme] = useState<"dark" | "light" | null>(null);

  useEffect(() => {
    async function loadThemePreference() {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);

        if (savedTheme === "dark" || savedTheme === "light") {
          setSavedTheme(savedTheme);
        }
      } catch (error) {
        console.error("Erro ao carregar preferência de tema:", error);
      }
    }

    loadThemePreference();
  }, []);

  const isDark = savedTheme
    ? savedTheme === "dark"
    : systemColorScheme === "dark";

  function toggleTheme() {
    const nextTheme = isDark ? "light" : "dark";
    setSavedTheme(nextTheme);

    AsyncStorage.setItem(THEME_STORAGE_KEY, nextTheme).catch((error) => {
      console.error("Erro ao salvar preferência de tema:", error);
    });
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
