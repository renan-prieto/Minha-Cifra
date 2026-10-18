
import { FinanceProvider } from "@/src/context/FinanceContext";
import { TaxSettingsProvider } from "@/src/context/TaxSettingsContext";
import { ThemeProvider, useTheme } from "@/src/context/ThemeContext";
import { UserProvider } from "@/src/context/UserContext";
import { initializeDatabase } from "@/src/database/database";
import * as NavigationBar from "expo-navigation-bar";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
  Stack,
} from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

interface UserProps {
  name: string;
  email: string;
  password: string;
  photo: any;
}

function App() {
  const { isDark } = useTheme();
  const [user, setUser] = useState<UserProps>();

  return (
    <NavigationThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <Stack initialRouteName="modal" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      </Stack>
      <StatusBar style={isDark ? "light" : "dark"} />
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setVisibilityAsync("hidden");
    }
  }, []);

  return (
    <SQLiteProvider
      databaseName="minhacifra.db"
      onInit={initializeDatabase}
    >
      <UserProvider>
        <TaxSettingsProvider>
          <FinanceProvider>
            <ThemeProvider>
              <App />
            </ThemeProvider>
          </FinanceProvider>
        </TaxSettingsProvider>
      </UserProvider>
    </SQLiteProvider>
  );
}
