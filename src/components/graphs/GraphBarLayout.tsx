import React from "react";
import { Text, View } from "react-native";

import GraphBars from "@/src/components/graphs/GraphBars";
import GraphLegend from "@/src/components/graphs/GraphLegend";
import { getBarStyles } from "@/src/components/styles/stylesBar";
import { useTheme } from "@/src/contexts/ThemeContext";

// Definição das props que o componente deve receber
interface GraphBarLayoutProps {
  data: any[];
  maxValue: number;
  receitas: number;
  despesas: number;
  investimentos: number;
}

export const GraphBarLayout = ({
  data,
  maxValue,
  receitas,
  despesas,
  investimentos,
}: GraphBarLayoutProps) => {
  const { isDark } = useTheme();
  const barStyles = getBarStyles(isDark);

  const formatCurrency = (value: number) =>
    `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  return (
    <View style={barStyles.graphCard}>
      <Text style={barStyles.graphTitle}>Movimentação financeira</Text>

      <View style={barStyles.graphArea}>
        <GraphBars data={data} maxValue={maxValue} />
        <GraphLegend />
      </View>

      <View style={barStyles.summary}>
        <View style={barStyles.summaryCard}>
          <Text style={barStyles.summaryLabel}>Receitas</Text>
          <Text style={barStyles.summaryValue}>{formatCurrency(receitas)}</Text>
        </View>

        <View style={barStyles.summaryCard}>
          <Text style={barStyles.summaryLabel}>Despesas</Text>
          <Text style={barStyles.summaryValue}>{formatCurrency(despesas)}</Text>
        </View>

        <View style={barStyles.summaryCard}>
          <Text style={barStyles.summaryLabel}>Economia</Text>
          <Text style={barStyles.summaryValue}>
            {formatCurrency(investimentos)}
          </Text>
        </View>
      </View>
    </View>
  );
};
