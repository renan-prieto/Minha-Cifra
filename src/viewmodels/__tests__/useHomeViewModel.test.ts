import { act, renderHook } from "@testing-library/react-native";
import { router } from "expo-router";

import { useFinance } from "@/src/contexts/FinanceContext";
import { useHomeViewModel } from "@/src/viewmodels/useHomeViewModel";

jest.mock("expo-router", () => ({
  router: { push: jest.fn() },
}));

jest.mock("@/src/contexts/FinanceContext", () => ({
  useFinance: jest.fn(),
}));

const financeData = {
  walletItemsEarn: [{ id: "1", title: "Salário", value: 5000 }],
  totalEarn: 5000,
  walletItemsInvestments: [{ id: "2", title: "CDB", value: 1000 }],
  totalInvestments: 1000,
  walletItemsLost: [{ id: "3", title: "Mercado", value: 300 }],
  totalLost: 300,
  balance: 3700,
};

describe("useHomeViewModel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useFinance as jest.Mock).mockReturnValue(financeData);
  });

  it("expõe os dados financeiros do contexto", () => {
    const { result } = renderHook(() => useHomeViewModel());

    expect(result.current.walletItemsEarn).toBe(financeData.walletItemsEarn);
    expect(result.current.totalEarn).toBe(5000);
    expect(result.current.totalInvestments).toBe(1000);
    expect(result.current.totalLost).toBe(300);
    expect(result.current.balance).toBe(3700);
  });

  it("inicia com os valores visíveis", () => {
    const { result } = renderHook(() => useHomeViewModel());

    expect(result.current.hideValues).toBe(false);
  });

  it("alterna a visibilidade dos valores", () => {
    const { result } = renderHook(() => useHomeViewModel());

    act(() => result.current.toggleHideValues());
    expect(result.current.hideValues).toBe(true);

    act(() => result.current.toggleHideValues());
    expect(result.current.hideValues).toBe(false);
  });

  it("navega para o formulário de lançamento", () => {
    const { result } = renderHook(() => useHomeViewModel());

    act(() => result.current.handleManageWallets());

    expect(router.push).toHaveBeenCalledWith("/newRelease");
  });
});
