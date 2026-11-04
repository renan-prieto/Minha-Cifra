
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
import { deleteDatabaseAsync, SQLiteProvider } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from "react-native";

import LoadingSplash from "@/src/components/common/LoadingSplash";

interface AppProps {
  loading: boolean;
  onReady: () => void;
}

function App({ loading, onReady }: AppProps) {
  const { isDark } = useTheme();

  return (
    <View style={{ flex: 1 }} onLayout={onReady}>
      <NavigationThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
        <Stack initialRouteName="modal" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="modal" options={{ presentation: "modal" }} />
        </Stack>
        <StatusBar hidden={loading} style={isDark ? "light" : "dark"} />
      </NavigationThemeProvider>
    </View>
  );
}

export default function RootLayout() {
  const [databaseReady, setDatabaseReady] = useState(false);
  const [appReady, setAppReady] = useState(false);
  const [animationFinished, setAnimationFinished] = useState(false);
  const [databaseError, setDatabaseError] = useState<Error | null>(null);
  const [resettingDatabase, setResettingDatabase] = useState(false);

  const loading =
    Platform.OS === "web"
      ? !(databaseReady && appReady)
      : !(databaseReady && appReady && animationFinished);

  const handleAppReady = useCallback(() => {
    setAppReady(true);
  }, []);

  const handleAnimationFinished = useCallback(() => {
    setAnimationFinished(true);
  }, []);

  const handleDatabaseInit = useCallback(async (db: any) => {
    await initializeDatabase(db);
    setDatabaseReady(true);
  }, []);

  const handleDatabaseError = useCallback((error: Error) => {
    console.error("Falha ao inicializar o banco de dados:", error);
    setTimeout(() => {
      setDatabaseError((currentError) => currentError ?? error);
    }, 0);
  }, []);

  const handleResetDatabase = useCallback(async () => {
    setResettingDatabase(true);
    try {
      await deleteDatabaseAsync("minhacifra.db");
      window.location.reload();
    } catch (error) {
      console.error("Falha ao apagar o banco local:", error);
      setDatabaseError(
        new Error(
          "Não foi possível apagar o banco automaticamente. Limpe os dados do site nas configurações do navegador e tente novamente.",
        ),
      );
      setResettingDatabase(false);
    }
  }, []);

  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setVisibilityAsync("hidden").catch(() => {});
    }
  }, []);

  if (databaseError) {
    return (
      <View style={styles.errorScreen}>
        <Text style={styles.errorTitle}>Não foi possível abrir o app</Text>
        <Text style={styles.errorMessage}>
          O banco de dados local apresentou um erro. Tente recarregar a página.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => window.location.reload()}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>Recarregar página</Text>
        </Pressable>
        {Platform.OS === "web" && (
          <>
            <Text style={styles.warningMessage}>
              Se o erro continuar, apagar o banco local remove os dados financeiros salvos neste navegador.
            </Text>
            <Pressable
              accessibilityRole="button"
              disabled={resettingDatabase}
              onPress={handleResetDatabase}
              style={styles.secondaryButton}
            >
              {resettingDatabase ? (
                <ActivityIndicator color="#EAF2FF" />
              ) : (
                <Text style={styles.secondaryButtonText}>
                  Apagar dados locais e reiniciar
                </Text>
              )}
            </Pressable>
          </>
        )}
      </View>
    );
  }

  return (
    <SQLiteProvider
      databaseName="minhacifra.db"
      onInit={handleDatabaseInit}
      onError={handleDatabaseError}
    >
      <View style={{ flex: 1 }}>
        <UserProvider>
          <TaxSettingsProvider>
            <FinanceProvider>
              <ThemeProvider>
                <App loading={loading} onReady={handleAppReady} />
              </ThemeProvider>
            </FinanceProvider>
          </TaxSettingsProvider>
        </UserProvider>
        {loading && Platform.OS !== "web" && (
          <LoadingSplash onAnimationFinished={handleAnimationFinished} />
        )}
      </View>
    </SQLiteProvider>
  );
}

const styles = StyleSheet.create({
  errorScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#06173D",
  },
  errorTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  errorMessage: {
    maxWidth: 420,
    marginTop: 12,
    color: "#EAF2FF",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  warningMessage: {
    maxWidth: 420,
    marginTop: 24,
    marginBottom: 12,
    color: "#B9C9E6",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 21,
  },
  primaryButton: {
    marginTop: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 6,
    backgroundColor: "#1D5BFF",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#7DB6FF",
    borderRadius: 6,
  },
  secondaryButtonText: {
    color: "#EAF2FF",
    fontSize: 14,
    fontWeight: "600",
  },
});
