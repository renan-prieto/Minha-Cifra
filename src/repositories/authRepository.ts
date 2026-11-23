import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import type { UserData } from "@/src/models/User";

import { api } from "./api";

const AUTH_TOKEN_KEY = "@minha_cifra:auth_token";
const USER_DATA_KEY = "@minha_cifra:user_data";

const isWebPlatform = () => Platform.OS === "web";

async function readToken() {
  if (isWebPlatform()) {
    return AsyncStorage.getItem(AUTH_TOKEN_KEY);
  }

  const secureToken = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);

  if (secureToken) {
    return secureToken;
  }

  // Migra tokens salvos por versões antigas em AsyncStorage.
  const legacyToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);

  if (legacyToken) {
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, legacyToken);
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
  }

  return legacyToken;
}

async function writeToken(token: string) {
  if (isWebPlatform()) {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    return;
  }

  await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
}

async function deleteToken() {
  if (!isWebPlatform()) {
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
  }

  await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
}

export type StoredUserData = UserData;

const applyAuthHeader = (token: string | null) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

export const saveAuthToken = async (token: string) => {
  try {
    await writeToken(token);
    applyAuthHeader(token);
  } catch (error) {
    console.error("Erro ao salvar token:", error);
  }
};

export const getAuthToken = async () => {
  try {
    const token = await readToken();

    // Restaura o header depois de reabrir o app, não apenas no login.
    applyAuthHeader(token);

    return token;
  } catch (error) {
    console.error("Erro ao recuperar token:", error);
    return null;
  }
};

export const removeAuthToken = async () => {
  try {
    await deleteToken();
    applyAuthHeader(null);
  } catch (error) {
    console.error("Erro ao remover token:", error);
  }
};

export const saveUserData = async (userData: StoredUserData) => {
  try {
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
  } catch (error) {
    console.error("Erro ao salvar dados do usuário:", error);
  }
};

export const getUserData = async () => {
  try {
    const userData = await AsyncStorage.getItem(USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Erro ao recuperar dados do usuário:", error);
    return null;
  }
};

export const removeUserData = async () => {
  try {
    await AsyncStorage.removeItem(USER_DATA_KEY);
  } catch (error) {
    console.error("Erro ao remover dados do usuário:", error);
  }
};

export const checkAuthentication = async (): Promise<boolean> => {
  try {
    const userData = await getUserData();

    // O modo visitante é uma sessão local de teste: não há token no servidor.
    if (userData?.isGuest) {
      return true;
    }

    const token = await getAuthToken();

    if (!token) {
      return false;
    }

    const response = await api.get("/auth/verify");
    return response.status === 200;
  } catch (error: any) {
    const status = error?.response?.status;

    // Só descarta a sessão quando o servidor realmente a rejeitou.
    // Falhas de rede não devem deslogar o usuário.
    if (status === 401 || status === 403) {
      await removeAuthToken();
      await removeUserData();
      return false;
    }

    console.error("Erro ao verificar autenticação:", error);
    return Boolean(await getAuthToken());
  }
};

export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const userData = await getUserData();

    // A sessão de visitante é válida apenas com os dados locais do usuário.
    if (userData?.isGuest) {
      return true;
    }

    const token = await getAuthToken();

    // A sessão só é válida com token e dados do usuário persistidos.
    return Boolean(token && userData);
  } catch (error) {
    console.error("Erro ao verificar se está autenticado:", error);
    return false;
  }
};

export const clearAuthData = async () => {
  try {
    await removeAuthToken();
    await removeUserData();
  } catch (error) {
    console.error("Erro ao limpar dados de autenticação:", error);
  }
};