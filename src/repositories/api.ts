import Constants from "expo-constants";
import { create } from "axios";

const DEFAULT_API_PORT = 3000;

/**
 * Resolve a URL da API sem depender de um IP fixo da máquina de desenvolvimento.
 *
 * Prioridade:
 * 1. EXPO_PUBLIC_API_URL (definida no .env de cada ambiente);
 * 2. host do servidor Metro/Expo (funciona no celular físico e no emulador em dev);
 * 3. localhost (web e simuladores).
 */
function resolveApiBaseUrl() {
  const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

  if (configuredUrl) {
    return configuredUrl.replace(/\/+$/, "");
  }

  const devServerHost = Constants.expoConfig?.hostUri?.split(":")[0];

  if (devServerHost) {
    return `http://${devServerHost}:${DEFAULT_API_PORT}`;
  }

  return `http://localhost:${DEFAULT_API_PORT}`;
}

export const API_BASE_URL = resolveApiBaseUrl();

export const api = create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});