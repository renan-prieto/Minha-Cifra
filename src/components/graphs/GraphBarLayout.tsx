import React, { useMemo } from "react";
import { Text, useWindowDimensions, View } from "react-native";

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

// Abaixo desta largura os cards do resumo são empilhados para o valor não quebrar
const SUMMARY_STACK_BREAKPOINT = 560;
const SUMMARY_VALUE_MAX_FONT_SIZE = 16;
const SUMMARY_VALUE_MIN_FONT_SIZE = 11;
// Largura média de um caractere em relação ao fontSize (fonte do sistema, negrito)
const CURRENCY_CHAR_WIDTH_RATIO = 0.62;
// Paddings fixos (conteúdo + card do gráfico + card do resumo) e espaço do rótulo
const COMPACT_SUMMARY_CHROME_WIDTH = 176;
const ROW_SUMMARY_CHROME_WIDTH = 124;

const formatCurrency = (value: number) =>
  `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

export const GraphBarLayout = ({
  data,
  maxValue,
  receitas,
  despesas,
  investimentos,
}: GraphBarLayoutProps) => {
  const { isDark } = useTheme();
  const barStyles = getBarStyles(isDark);
  const { width, fontScale } = useWindowDimensions();

  const isStackedSummary = width < SUMMARY_STACK_BREAKPOINT;

  const summaryItems = useMemo(
    () => [
      { label: "Receitas", value: receitas },
      { label: "Despesas", value: despesas },
      { label: "Economia", value: investimentos },
    ],
    [receitas, despesas, investimentos],
  );

  // Ajusta o tamanho da fonte para o maior valor caber em uma única linha
  const summaryValueFontSize = useMemo(() => {
    const longestValueLength = Math.max(
      ...summaryItems.map((item) => formatCurrency(item.value).length),
      1,
    );

    const availableWidth = isStackedSummary
      ? width - COMPACT_SUMMARY_CHROME_WIDTH
      : (width - ROW_SUMMARY_CHROME_WIDTH) / summaryItems.length;

    const safeFontScale = Math.max(fontScale || 1, 1);
    const fittedFontSize =
      availableWidth /
      (longestValueLength * CURRENCY_CHAR_WIDTH_RATIO * safeFontScale);

    return Math.min(
      SUMMARY_VALUE_MAX_FONT_SIZE,
      Math.max(SUMMARY_VALUE_MIN_FONT_SIZE, fittedFontSize),
    );
  }, [fontScale, isStackedSummary, summaryItems, width]);

  return (
    <View style={barStyles.graphCard}>
      <Text style={barStyles.graphTitle}>Movimentação financeira</Text>

      <View style={barStyles.graphArea}>
        <GraphBars data={data} maxValue={maxValue} />
        <GraphLegend />
      </View>

      <View
        style={[
          barStyles.summary,
          isStackedSummary && barStyles.summaryStacked,
        ]}
      >
        {summaryItems.map((item) => (
          <View
            key={item.label}
            style={[
              barStyles.summaryCard,
              isStackedSummary && barStyles.summaryCardStacked,
            ]}
          >
            <Text
              style={[
                barStyles.summaryLabel,
                isStackedSummary && barStyles.summaryLabelStacked,
              ]}
            >
              {item.label}
            </Text>

            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
              style={[
                barStyles.summaryValue,
                isStackedSummary && barStyles.summaryValueStacked,
                { fontSize: summaryValueFontSize },
              ]}
            >
              {formatCurrency(item.value)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};
