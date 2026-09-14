import { useMemo } from "react";

import { useFinance } from "@/src/context/FinanceContext";
import { useGraphicFilter } from "@/src/hooks/useGraphicFilter";

export function useFinancialDashboard() {
  const { balance, itemsEarn, itemsInvestments, itemsLost } = useFinance();

  const {
    currentPrevMonth,
    currentMonthLabel,
    currentNextMonth,
    currentYearLabel,
    nextMonth,
    prevMonth,
  } = useGraphicFilter();

  const isCurrentMonth = (item: { month: string; year: number }) =>
    item.month.toLocaleLowerCase() === currentMonthLabel.toLocaleLowerCase() &&
    item.year === currentYearLabel;

  const dashboard = useMemo(() => {
    const earnFiltered = itemsEarn.filter(isCurrentMonth);

    const investmentsFiltered = itemsInvestments.filter(isCurrentMonth);

    const lostFiltered = itemsLost.filter(isCurrentMonth);

    const receitas = earnFiltered.reduce((acc, item) => acc + item.value, 0);
    const despesas = lostFiltered.reduce((acc, item) => acc + item.value, 0);
    const investimentos = investmentsFiltered.reduce(
      (acc, item) => acc + item.value,
      0,
    );

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
    balance,
    currentMonthLabel,
    currentNextMonth,
    currentPrevMonth,
    currentYearLabel,
    itemsEarn,
    itemsInvestments,
    itemsLost,
    isCurrentMonth,
    nextMonth,
    prevMonth,
  ]);

  return dashboard;
}
