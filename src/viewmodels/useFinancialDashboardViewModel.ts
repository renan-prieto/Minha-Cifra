import { useMemo, useState } from "react";

import { useFinance } from "@/src/contexts/FinanceContext";
import { useGraphicFilter } from "@/src/viewmodels/useGraphicFilter";

export type GraphType = "pizza" | "bars";

/**
 * ViewModel do dashboard financeiro.
 * Cruza o mês selecionado com os lançamentos e entrega dados prontos
 * para os gráficos de barras e pizza.
 */
export function useFinancialDashboardViewModel() {
  const { itemsEarn, itemsInvestments, itemsLost } = useFinance();
  const [graphType, setGraphType] = useState<GraphType>("bars");

  const {
    currentPrevMonth,
    currentMonthLabel,
    currentNextMonth,
    currentYearLabel,
    nextMonth,
    prevMonth,
  } = useGraphicFilter();

  const dashboard = useMemo(() => {
    const isCurrentMonth = (item: { month: string; year: number }) =>
      item.month.toLocaleLowerCase() ===
        currentMonthLabel.toLocaleLowerCase() &&
      item.year === currentYearLabel;

    const earnFiltered = itemsEarn.filter(isCurrentMonth);
    const investmentsFiltered = itemsInvestments.filter(isCurrentMonth);
    const lostFiltered = itemsLost.filter(isCurrentMonth);

    const receitas = earnFiltered.reduce((acc, item) => acc + item.value, 0);
    const despesas = lostFiltered.reduce((acc, item) => acc + item.value, 0);
    const investimentos = investmentsFiltered.reduce(
      (acc, item) => acc + item.value,
      0,
    );
    const balance = receitas - despesas - investimentos;

    const barData = [
      {
        year: currentYearLabel,
        month: currentMonthLabel,
        earn: receitas,
        lost: despesas,
        investments: investimentos,
      },
    ];

    const pizzaData = lostFiltered.map((item) => ({
      id: item.id,
      title: item.tag,
      value: item.value,
    }));

    const maxValue = Math.max(receitas, despesas, investimentos, 1);

    return {
      balance,
      currentPrevMonth,
      currentMonthLabel,
      currentNextMonth,
      currentYearLabel,
      nextMonth,
      prevMonth,
      receitas,
      despesas,
      investimentos,
      barData,
      pizzaData,
      maxValue,
    };
  }, [
    currentMonthLabel,
    currentNextMonth,
    currentPrevMonth,
    currentYearLabel,
    itemsEarn,
    itemsInvestments,
    itemsLost,
    nextMonth,
    prevMonth,
  ]);

  return { ...dashboard, graphType, setGraphType };
}
