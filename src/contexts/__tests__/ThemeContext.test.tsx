import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, renderHook, waitFor } from "@testing-library/react-native";

import { ThemeProvider, useTheme } from "@/src/contexts/ThemeContext";

const mockUseColorScheme = jest.fn();

jest.mock("react-native/Libraries/Utilities/useColorScheme", () => ({
  __esModule: true,
  default: () => mockUseColorScheme(),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

const storageKey = "@minhacifra/theme";

function renderTheme() {
  return renderHook(() => useTheme(), { wrapper: ThemeProvider });
}

describe("ThemeContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseColorScheme.mockReturnValue("light");
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  it("segue o tema claro do sistema por padrão", () => {
    const { result } = renderTheme();

    expect(result.current.isDark).toBe(false);
  });

  it("segue o tema escuro do sistema por padrão", () => {
    mockUseColorScheme.mockReturnValue("dark");
    const { result } = renderTheme();

    expect(result.current.isDark).toBe(true);
  });

  it("carrega o tema escuro persistido", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue("dark");
    const { result } = renderTheme();

    await waitFor(() => expect(result.current.isDark).toBe(true));
    expect(AsyncStorage.getItem).toHaveBeenCalledWith(storageKey);
  });

  it("o tema persistido sobrescreve o tema do sistema", async () => {
    mockUseColorScheme.mockReturnValue("dark");
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue("light");
    const { result } = renderTheme();

    await waitFor(() => expect(result.current.isDark).toBe(false));
  });

  it("ignora valores persistidos inválidos", async () => {
    mockUseColorScheme.mockReturnValue("dark");
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue("roxo");
    const { result } = renderTheme();

    await waitFor(() =>
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(storageKey),
    );
    expect(result.current.isDark).toBe(true);
  });

  it("alterna do claro para o escuro e persiste", () => {
    const { result } = renderTheme();

    act(() => result.current.toggleTheme());

    expect(result.current.isDark).toBe(true);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(storageKey, "dark");
  });

  it("alterna do escuro para o claro e persiste", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue("dark");
    const { result } = renderTheme();

    await waitFor(() => expect(result.current.isDark).toBe(true));
    act(() => result.current.toggleTheme());

    expect(result.current.isDark).toBe(false);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(storageKey, "light");
  });

  it("mantém o tema do sistema quando a leitura falha", async () => {
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    mockUseColorScheme.mockReturnValue("dark");
    (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error("falha"));
    const { result } = renderTheme();

    await waitFor(() =>
      expect(consoleError).toHaveBeenCalledWith(
        "Erro ao carregar preferência de tema:",
        expect.any(Error),
      ),
    );
    expect(result.current.isDark).toBe(true);
    consoleError.mockRestore();
  });

  it("registra erro ao persistir a troca de tema", async () => {
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error("falha"));
    const { result } = renderTheme();

    act(() => result.current.toggleTheme());

    await waitFor(() =>
      expect(consoleError).toHaveBeenCalledWith(
        "Erro ao salvar preferência de tema:",
        expect.any(Error),
      ),
    );
    consoleError.mockRestore();
  });
});
