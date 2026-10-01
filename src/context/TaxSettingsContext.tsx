import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

const TAX_SETTINGS_STORAGE_KEY = "@minhacifra/tax-settings";

export type TaxKey = "inss" | "irrf";

type TaxSettings = Record<TaxKey, boolean>;

interface TaxSettingsContextData {
  taxes: TaxSettings;
  setTaxEnabled: (tax: TaxKey, enabled: boolean) => void;
}

const TaxSettingsContext = createContext<TaxSettingsContextData | undefined>(
  undefined,
);

export function TaxSettingsProvider({ children }: { children: ReactNode }) {
  const [taxes, setTaxes] = useState<TaxSettings>({ inss: true, irrf: true });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function loadTaxSettings() {
      try {
        const storedSettings = await AsyncStorage.getItem(
          TAX_SETTINGS_STORAGE_KEY,
        );
        if (storedSettings) {
          const parsedSettings = JSON.parse(storedSettings) as Partial<TaxSettings>;
          setTaxes({
            inss: parsedSettings.inss !== false,
            irrf: parsedSettings.irrf !== false,
          });
        }
      } catch (error) {
        console.error("Erro ao carregar impostos selecionados:", error);
      } finally {
        setIsLoaded(true);
      }
    }

    loadTaxSettings();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    AsyncStorage.setItem(TAX_SETTINGS_STORAGE_KEY, JSON.stringify(taxes)).catch(
      (error) => {
        console.error("Erro ao salvar impostos selecionados:", error);
      },
    );
  }, [isLoaded, taxes]);

  const setTaxEnabled = useCallback((tax: TaxKey, enabled: boolean) => {
    setTaxes((currentTaxes) => ({ ...currentTaxes, [tax]: enabled }));
  }, []);

  const value = useMemo(
    () => ({ taxes, setTaxEnabled }),
    [taxes, setTaxEnabled],
  );

  return (
    <TaxSettingsContext.Provider value={value}>
      {children}
    </TaxSettingsContext.Provider>
  );
}

export function useTaxSettings() {
  const context = useContext(TaxSettingsContext);
  if (!context) {
    throw new Error("useTaxSettings deve ser usado dentro de TaxSettingsProvider");
  }
  return context;
}