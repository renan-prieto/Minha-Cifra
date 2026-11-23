import { act, renderHook } from "@testing-library/react-native";

import { useFinance } from "@/src/contexts/FinanceContext";
import { useFinancialDashboardViewModel } from "@/src/viewmodels/useFinancialDashboardViewModel";
import { useGraphicFilter } from "@/src/viewmodels/useGraphicFilter";

jest.mock("@/src/contexts/FinanceContext", () => ({
  useFinance: jest.fn(),
}));

jest.mock("@/src/viewmodels/useGraphicFilter", () => ({
  useGraphicFilter: jest.fn(),
}));

const filter = {
  currentPrevMonth: "Fevereiro",
  currentMonthLabel: "Março",
  currentNextMonth: "Abril",
  currentYearLabel: 2024,
  nextMonth: jest.fn(),
  prevMonth: jest.fn(),
};

const financeData = {
  itemsEarn: [
    { id: "1", title: "Salário", value: 5000, tag: "Trabalho", year: 2024, month: "Março" },
    { id: "2", title: "Freela", value: 1000, tag: "Extra", year: 2024, month: "março" },
    { id: "3", title: "Salário antigo", value: 4000, tag: "Trabalho", year: 2024, month: "Fevereiro" },
  ],
  itemsInvestments: [
    { id: "4", title: "CDB", value: 1000, tag: "Renda fixa", year: 2024, month: "Março" },
  ],
  itemsLost: [
    { id: "5", title: "Mercado", value: 300, tag: "Alimentação", year: 2024, month: "Março" },
    { id: "6", title: "Aluguel", value: 1200, tag: "Casa", year: 2024, month: "MARÇO" },
    { id: "7", title: "Cinema", value: 50, tag: "Lazer", year: 2023, month: "Março" },
  ],
};

describe("useFinancialDashboardViewModel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useFinance as jest.Mock).mockReturnValue(financeData);
    (useGraphicFilter as jest.Mock).mockReturnValue(filter);
  });

  it("soma apenas os lançamentos do mês e ano selecionados", () => {
    const { result } = renderHook(() => useFinancialDashboardViewModel());

    expect(result.current.receitas).toBe(6000);
    expect(result.current.despesas).toBe(1500);
    expect(result.current.investimentos).toBe(1000);
    expect(result.current.balance).toBe(3500);
  });

  it("monta os dados da barra do período", () => {
    const { result } = renderHook(() => useFinancialDashboardViewModel());

    expect(result.current.barData).toEqual([
      {
        year: 2024,
        month: "Março",
        earn: 6000,
        lost: 1500,
        investments: 1000,
      },
    ]);
  });

  it("monta os dados da pizza com as despesas do período", () => {
    const { result } = renderHook(() => useFinancialDashboardViewModel());

    expect(result.current.pizzaData).toEqual([
      { id: "5", title: "Alimentação", value: 300 },
      { id: "6", title: "Casa", value: 1200 },
    ]);
  });

  it("calcula o maior valor para escalar os gráficos", () => {
    const { result } = renderHook(() => useFinancialDashboardViewModel());

    expect(result.current.maxValue).toBe(6000);
  });

  it("usa 1 como maior valor quando não há lançamentos", () => {
    (useFinance as jest.Mock).mockReturnValue({
      itemsEarn: [],
      itemsInvestments: [],
      itemsLost: [],
    });

    const { result } = renderHook(() => useFinancialDashboardViewModel());

    expect(result.current.maxValue).toBe(1);
    expect(result.current.balance).toBe(0);
  });

  it("expõe os controles do filtro de mês", () => {
    const { result } = renderHook(() => useFinancialDashboardViewModel());

    expect(result.current.currentMonthLabel).toBe("Março");
    expect(result.current.currentYearLabel).toBe(2024);
    expect(result.current.nextMonth).toBe(filter.nextMonth);
    expect(result.current.prevMonth).toBe(filter.prevMonth);
  });

  it("inicia no gráfico de barras e permite alternar", () => {
    const { result } = renderHook(() => useFinancialDashboardViewModel());

    expect(result.current.graphType).toBe("bars");

    act(() => result.current.setGraphType("pizza"));
    expect(result.current.graphType).toBe("pizza");
  });
});
