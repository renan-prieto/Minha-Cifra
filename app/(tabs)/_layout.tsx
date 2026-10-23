import * as NavigationBar from "expo-navigation-bar";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
  Stack,
} from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { Platform, View } from "react-native";

import LoadingSplash from "@/src/components/common/LoadingSplash";
import { FinanceProvider } from "@/src/context/FinanceContext";
import { TaxSettingsProvider } from "@/src/context/TaxSettingsContext";
import { ThemeProvider, useTheme } from "@/src/context/ThemeContext";
import { UserProvider } from "@/src/context/UserContext";
import { initializeDatabase } from "@/src/database/database";

interface AppProps {
  loading: boolean;
  onReady: () => void;
}

function App({ loading, onReady }: AppProps) {
  const { isDark } = useTheme();

  return (
    <View style={{ flex: 1 }} onLayout={onReady}>
      <NavigationThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
        <Stack
          initialRouteName="modal"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal" }}
          />
        </Stack>

        <StatusBar
          hidden={loading}
          style={isDark ? "light" : "dark"}
        />
      </NavigationThemeProvider>
    </View>
  );
}

export default function RootLayout() {
  const [databaseReady, setDatabaseReady] = useState(false);
  const [appReady, setAppReady] = useState(false);

  const loading = !(databaseReady && appReady);

  const handleAppReady = useCallback(() => {
    setAppReady(true);
  }, []);

  const handleDatabaseInit = useCallback(async (db: any) => {
    await initializeDatabase(db);
    setDatabaseReady(true);
  }, []);

  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setVisibilityAsync("hidden").catch(() => {});
    }
  }, []);

  return (
    <SQLiteProvider
      databaseName="minhacifra.db"
      onInit={handleDatabaseInit}
    >
      <View style={{ flex: 1 }}>
        <UserProvider>
          <TaxSettingsProvider>
            <FinanceProvider>
              <ThemeProvider>
                <App
                  loading={loading}
                  onReady={handleAppReady}
                />
              </ThemeProvider>
            </FinanceProvider>
          </TaxSettingsProvider>
        </UserProvider>

        {loading && <LoadingSplash />}
      </View>
    </SQLiteProvider>
  );
}