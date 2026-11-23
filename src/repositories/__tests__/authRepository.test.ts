import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

import { api } from "../api";
import {
  checkAuthentication,
  clearAuthData,
  getAuthToken,
  getUserData,
  isAuthenticated,
  removeAuthToken,
  removeUserData,
  saveAuthToken,
  saveUserData,
} from "../authRepository";

jest.mock("react-native", () => ({
  Platform: {
    get OS() {
      return (globalThis as { __mockPlatformOS?: string }).__mockPlatformOS ?? "android";
    },
  },
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock("../api", () => ({
  api: {
    get: jest.fn(),
    defaults: { headers: { common: {} } },
  },
}));

const authTokenKey = "@minha_cifra:auth_token";
const userDataKey = "@minha_cifra:user_data";

const storedUser = { id: "1", email: "renan@example.com" };

/**
 * O repositório usa a mesma chave para dados do usuário e para o token
 * legado. O mock precisa responder por chave para simular o AsyncStorage real.
 */
function mockStoredUser(user: object | null, rawValue?: string) {
  (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
    if (key === userDataKey) {
      if (rawValue !== undefined) return Promise.resolve(rawValue);
      return Promise.resolve(user ? JSON.stringify(user) : null);
    }
    return Promise.resolve(null);
  });
}

describe("authRepository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete (globalThis as { __mockPlatformOS?: string }).__mockPlatformOS;
    api.defaults.headers.common = {};
    mockStoredUser(null);
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
    (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);
    (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
  });

  describe("saveAuthToken", () => {
    it("salva no SecureStore e configura o header Authorization", async () => {
      await saveAuthToken("token-123");

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        authTokenKey,
        "token-123",
      );
      expect(api.defaults.headers.common.Authorization).toBe("Bearer token-123");
    });

    it("registra o erro sem lançar quando o armazenamento falha", async () => {
      const consoleError = jest
        .spyOn(console, "error")
        .mockImplementation(() => undefined);
      (SecureStore.setItemAsync as jest.Mock).mockRejectedValueOnce(
        new Error("falha"),
      );

      await expect(saveAuthToken("token-123")).resolves.toBeUndefined();

      expect(consoleError).toHaveBeenCalledWith(
        "Erro ao salvar token:",
        expect.any(Error),
      );
      consoleError.mockRestore();
    });
  });

  describe("getAuthToken", () => {
    it("retorna o token do SecureStore e restaura o header", async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("token-seguro");

      await expect(getAuthToken()).resolves.toBe("token-seguro");

      expect(api.defaults.headers.common.Authorization).toBe(
        "Bearer token-seguro",
      );
    });

    it("migra o token legado do AsyncStorage para o SecureStore", async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) =>
        Promise.resolve(key === authTokenKey ? "token-legado" : null),
      );

      await expect(getAuthToken()).resolves.toBe("token-legado");

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        authTokenKey,
        "token-legado",
      );
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(authTokenKey);
    });

    it("remove o header quando não há token", async () => {
      api.defaults.headers.common.Authorization = "Bearer antigo";

      await expect(getAuthToken()).resolves.toBeNull();

      expect(api.defaults.headers.common.Authorization).toBeUndefined();
    });

    it("retorna null e registra o erro quando a leitura falha", async () => {
      const consoleError = jest
        .spyOn(console, "error")
        .mockImplementation(() => undefined);
      (SecureStore.getItemAsync as jest.Mock).mockRejectedValueOnce(
        new Error("falha"),
      );

      await expect(getAuthToken()).resolves.toBeNull();
      expect(consoleError).toHaveBeenCalledWith(
        "Erro ao recuperar token:",
        expect.any(Error),
      );
      consoleError.mockRestore();
    });
  });

  describe("removeAuthToken", () => {
    it("apaga o token do SecureStore e do AsyncStorage", async () => {
      api.defaults.headers.common.Authorization = "Bearer token";

      await removeAuthToken();

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(authTokenKey);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(authTokenKey);
      expect(api.defaults.headers.common.Authorization).toBeUndefined();
    });
  });

  describe("dados do usuário", () => {
    it("salva e recupera o usuário serializado", async () => {
      const user = { id: "1", email: "renan@example.com", name: "Renan" };

      await saveUserData(user);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        userDataKey,
        JSON.stringify(user),
      );

      mockStoredUser(user);
      await expect(getUserData()).resolves.toEqual(user);
    });

    it("retorna null quando não há usuário persistido", async () => {
      mockStoredUser(null);

      await expect(getUserData()).resolves.toBeNull();
    });

    it("retorna null quando o JSON persistido é inválido", async () => {
      const consoleError = jest
        .spyOn(console, "error")
        .mockImplementation(() => undefined);
      mockStoredUser(null, "{json inválido");

      await expect(getUserData()).resolves.toBeNull();
      expect(consoleError).toHaveBeenCalledWith(
        "Erro ao recuperar dados do usuário:",
        expect.any(Error),
      );
      consoleError.mockRestore();
    });

    it("remove os dados do usuário", async () => {
      await removeUserData();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(userDataKey);
    });
  });

  describe("checkAuthentication", () => {
    it("aceita a sessão de visitante sem consultar o servidor", async () => {
      mockStoredUser({ ...storedUser, id: "-1", isGuest: true });

      await expect(checkAuthentication()).resolves.toBe(true);
      expect(api.get).not.toHaveBeenCalled();
    });

    it("retorna false quando não há token", async () => {
      mockStoredUser(storedUser);
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      await expect(checkAuthentication()).resolves.toBe(false);
      expect(api.get).not.toHaveBeenCalled();
    });

    it("retorna true quando o servidor confirma a sessão", async () => {
      mockStoredUser(storedUser);
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("token");
      (api.get as jest.Mock).mockResolvedValue({ status: 200 });

      await expect(checkAuthentication()).resolves.toBe(true);
      expect(api.get).toHaveBeenCalledWith("/auth/verify");
    });

    it("descarta a sessão quando o servidor responde 401", async () => {
      mockStoredUser(storedUser);
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("token");
      (api.get as jest.Mock).mockRejectedValue({ response: { status: 401 } });

      await expect(checkAuthentication()).resolves.toBe(false);

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(authTokenKey);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(userDataKey);
    });

    it("descarta a sessão quando o servidor responde 403", async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("token");
      mockStoredUser(storedUser);
      (api.get as jest.Mock).mockRejectedValue({ response: { status: 403 } });

      await expect(checkAuthentication()).resolves.toBe(false);
    });

    it("mantém a sessão em falhas de rede quando ainda existe token", async () => {
      const consoleError = jest
        .spyOn(console, "error")
        .mockImplementation(() => undefined);
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("token");
      mockStoredUser(storedUser);
      (api.get as jest.Mock).mockRejectedValue(new Error("sem rede"));

      await expect(checkAuthentication()).resolves.toBe(true);
      consoleError.mockRestore();
    });

    it("retorna false em falha de rede quando não há token", async () => {
      const consoleError = jest
        .spyOn(console, "error")
        .mockImplementation(() => undefined);
      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce("token")
        .mockResolvedValueOnce(null);
      mockStoredUser(storedUser);
      (api.get as jest.Mock).mockRejectedValue(new Error("sem rede"));

      await expect(checkAuthentication()).resolves.toBe(false);
      consoleError.mockRestore();
    });
  });

  describe("isAuthenticated", () => {
    it("aceita o visitante pelos dados locais", async () => {
      mockStoredUser({ ...storedUser, id: "-1", isGuest: true });

      await expect(isAuthenticated()).resolves.toBe(true);
      expect(SecureStore.getItemAsync).not.toHaveBeenCalled();
    });

    it("exige token e dados do usuário", async () => {
      mockStoredUser(storedUser);
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("token");

      await expect(isAuthenticated()).resolves.toBe(true);
    });

    it("retorna false quando falta o token", async () => {
      mockStoredUser(storedUser);
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      await expect(isAuthenticated()).resolves.toBe(false);
    });

    it("retorna false quando faltam os dados do usuário", async () => {
      mockStoredUser(null);
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("token");

      await expect(isAuthenticated()).resolves.toBe(false);
    });

    it("retorna false quando a leitura lança erro", async () => {
      const consoleError = jest
        .spyOn(console, "error")
        .mockImplementation(() => undefined);
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error("falha"));

      await expect(isAuthenticated()).resolves.toBe(false);
      consoleError.mockRestore();
    });
  });

  describe("clearAuthData", () => {
    it("remove token e dados do usuário", async () => {
      await clearAuthData();

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(authTokenKey);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(authTokenKey);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(userDataKey);
    });
  });

  describe("web", () => {
    afterEach(() => {
      delete (globalThis as { __mockPlatformOS?: string }).__mockPlatformOS;
    });

    it("usa AsyncStorage em vez do SecureStore", async () => {
      (globalThis as { __mockPlatformOS?: string }).__mockPlatformOS = "web";

      await saveAuthToken("token-web");

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        authTokenKey,
        "token-web",
      );
      expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
      expect(api.defaults.headers.common.Authorization).toBe(
        "Bearer token-web",
      );

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue("token-salvo");
      await expect(getAuthToken()).resolves.toBe("token-salvo");

      await removeAuthToken();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(authTokenKey);
      expect(SecureStore.deleteItemAsync).not.toHaveBeenCalled();
    });
  });
});
