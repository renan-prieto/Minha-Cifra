import { router } from "expo-router";
import { useCallback, useState } from "react";

import { useFinance } from "@/src/contexts/FinanceContext";

/**
 * ViewModel da Home.
 * Expõe os totais e listas da carteira já filtrados pelo período atual,
 * além do controle de visibilidade dos valores.
 */
export function useHomeViewModel() {
  const {
    walletItemsEarn,
    totalEarn,
    walletItemsInvestments,
    totalInvestments,
    walletItemsLost,
    totalLost,
    balance,
  } = useFinance();

  const [hideValues, setHideValues] = useState(false);

  const toggleHideValues = useCallback(
    () => setHideValues((prev) => !prev),
    [],
  );

  const handleManageWallets = useCallback(() => {
    router.push("/newRelease");
  }, []);

  return {
    balance,
    walletItemsEarn,
    totalEarn,
    walletItemsInvestments,
    totalInvestments,
    walletItemsLost,
    totalLost,
    hideValues,
    toggleHideValues,
    handleManageWallets,
  };
}
