import type { ReactNode } from "react";

import { FinanceProvider } from "@/src/contexts/FinanceContext";
import { TaxSettingsProvider } from "@/src/contexts/TaxSettingsContext";
import { ThemeProvider } from "@/src/contexts/ThemeContext";
import { UserProvider } from "@/src/contexts/UserContext";

/**
 * Composição única dos providers globais da aplicação.
 * Mantém o `app/_layout.tsx` focado apenas no roteamento.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <UserProvider>
      <TaxSettingsProvider>
        <FinanceProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </FinanceProvider>
      </TaxSettingsProvider>
    </UserProvider>
  );
}
