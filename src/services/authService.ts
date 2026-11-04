import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "./api";

const AUTH_TOKEN_KEY = "@minha_cifra:auth_token";
const USER_DATA_KEY = "@minha_cifra:user_data";

export interface StoredUserData {
  id: string;
  name?: string;
  email: string;
  profileImage?: string;
}

export const saveAuthToken = async (token: string) => {
  try {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } catch (error) {
    console.error("Erro ao salvar token:", error);
  }
};

export const getAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    return token;
  } catch (error) {
    console.error("Erro ao recuperar token:", error);
    return null;
  }
};

export const removeAuthToken = async () => {
  try {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    delete api.defaults.headers.common["Authorization"];
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
    const token = await getAuthToken();

    if (!token) {
      return false;
    }

    const response = await api.get("/auth/verify", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.status === 200;
  } catch (error) {
    console.error("Erro ao verificar autenticação:", error);
    await removeAuthToken();
    return false;
  }
};

export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const token = await getAuthToken();
    if (token) return true;

    return !!(await getUserData());
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
