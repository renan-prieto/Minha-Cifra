import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, renderHook, waitFor } from "@testing-library/react-native";

import {
  TaxSettingsProvider,
  useTaxSettings,
} from "@/src/contexts/TaxSettingsContext";

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

const storageKey = "@minhacifra/tax-settings";

function renderTaxSettings() {
  return renderHook(() => useTaxSettings(), { wrapper: TaxSettingsProvider });
}

describe("TaxSettingsContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  it("inicia com INSS e IRRF habilitados", async () => {
    const { result } = renderTaxSettings();

    expect(result.current.taxes).toEqual({ inss: true, irrf: true });
    await waitFor(() => expect(AsyncStorage.setItem).toHaveBeenCalled());
  });

  it("carrega os impostos persistidos", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({ inss: false, irrf: true }),
    );
    const { result } = renderTaxSettings();

    await waitFor(() =>
      expect(result.current.taxes).toEqual({ inss: false, irrf: true }),
    );
    expect(AsyncStorage.getItem).toHaveBeenCalledWith(storageKey);
  });

  it("trata campos ausentes como habilitados", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({ inss: false }),
    );
    const { result } = renderTaxSettings();

    await waitFor(() =>
      expect(result.current.taxes).toEqual({ inss: false, irrf: true }),
    );
  });

  it("persiste as alterações", async () => {
    const { result } = renderTaxSettings();

    await waitFor(() => expect(AsyncStorage.setItem).toHaveBeenCalled());
    act(() => result.current.setTaxEnabled("inss", false));

    expect(result.current.taxes).toEqual({ inss: false, irrf: true });
    await waitFor(() =>
      expect(AsyncStorage.setItem).toHaveBeenLastCalledWith(
        storageKey,
        JSON.stringify({ inss: false, irrf: true }),
      ),
    );
  });

  it("mantém os padrões quando a leitura falha", async () => {
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error("falha"));
    const { result } = renderTaxSettings();

    await waitFor(() =>
      expect(consoleError).toHaveBeenCalledWith(
        "Erro ao carregar impostos selecionados:",
        expect.any(Error),
      ),
    );
    expect(result.current.taxes).toEqual({ inss: true, irrf: true });
    consoleError.mockRestore();
  });

  it("registra erro ao persistir", async () => {
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error("falha"));
    const { result } = renderTaxSettings();

    await waitFor(() => expect(AsyncStorage.setItem).toHaveBeenCalled());
    act(() => result.current.setTaxEnabled("irrf", false));

    await waitFor(() =>
      expect(consoleError).toHaveBeenCalledWith(
        "Erro ao salvar impostos selecionados:",
        expect.any(Error),
      ),
    );
    consoleError.mockRestore();
  });

  it("exige o provider", () => {
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    expect(() => renderHook(() => useTaxSettings())).toThrow(
      "useTaxSettings deve ser usado dentro de TaxSettingsProvider",
    );
    consoleError.mockRestore();
  });
});
