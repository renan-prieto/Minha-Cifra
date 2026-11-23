jest.mock("axios", () => ({
  create: jest.fn(() => ({ defaults: { headers: { common: {} } } })),
}));

type LoadOptions = {
  envUrl?: string;
  hostUri?: string;
};

function loadApiModule({ envUrl, hostUri }: LoadOptions = {}) {
  jest.resetModules();

  if (envUrl === undefined) {
    delete process.env.EXPO_PUBLIC_API_URL;
  } else {
    process.env.EXPO_PUBLIC_API_URL = envUrl;
  }

  jest.doMock("expo-constants", () => ({
    __esModule: true,
    default: { expoConfig: hostUri ? { hostUri } : null },
  }));

  const { create } = require("axios");
  const { API_BASE_URL } = require("../api");

  return { API_BASE_URL, create };
}

describe("api", () => {
  afterEach(() => {
    delete process.env.EXPO_PUBLIC_API_URL;
    jest.resetModules();
  });

  it("prioriza EXPO_PUBLIC_API_URL e remove barras finais", () => {
    const { API_BASE_URL } = loadApiModule({
      envUrl: "https://api.minhacifra.com///",
      hostUri: "192.168.0.10:8081",
    });

    expect(API_BASE_URL).toBe("https://api.minhacifra.com");
  });

  it("usa o host do Metro quando não há URL configurada", () => {
    const { API_BASE_URL } = loadApiModule({
      hostUri: "192.168.0.10:8081",
    });

    expect(API_BASE_URL).toBe("http://192.168.0.10:3000");
  });

  it("usa localhost como fallback", () => {
    const { API_BASE_URL } = loadApiModule({});

    expect(API_BASE_URL).toBe("http://localhost:3000");
  });

  it("cria o cliente com timeout e headers padrão", () => {
    const { create } = loadApiModule({ envUrl: "http://localhost:4000" });

    expect(create).toHaveBeenCalledWith({
      baseURL: "http://localhost:4000",
      timeout: 15000,
      headers: { "Content-Type": "application/json" },
    });
  });
});
