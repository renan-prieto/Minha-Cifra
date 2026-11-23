import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Header } from "@/src/components/common/header";
import { AiChat } from "@/src/components/common/iabox";
import BalanceCard from "@/src/components/graphs/BalanceCard";
import { GraphBarLayout } from "@/src/components/graphs/GraphBarLayout";
import { GraphPieLayout } from "@/src/components/graphs/GraphPieLayout";
import MonthNavigator from "@/src/components/graphs/MonthNavigator";
import { getBarStyles } from "@/src/components/styles/stylesBar";
import { useTheme } from "@/src/contexts/ThemeContext";
import { useFinancialDashboardViewModel } from "@/src/viewmodels/useFinancialDashboardViewModel";

export default function FinancialDashboardView() {
  const { isDark } = useTheme();
  const barStyles = getBarStyles(isDark);

  const {
    balance,
    currentPrevMonth,
    currentMonthLabel,
    currentNextMonth,
    currentYearLabel,
    nextMonth,
    prevMonth,
    barData,
    pizzaData,
    maxValue,
    receitas,
    despesas,
    investimentos,
    graphType,
    setGraphType,
  } = useFinancialDashboardViewModel();

  return (
    <SafeAreaView style={barStyles.container}>
      <ScrollView
        contentContainerStyle={barStyles.content}
        showsVerticalScrollIndicator={false}
      >
        <Header
          title="Resumo Financeiro"
          subtitle="Acompanhe sua movimentação financeira"
        />

        <BalanceCard balance={balance} />

        <MonthNavigator
          prevMonth={currentPrevMonth}
          month={currentMonthLabel}
          nextMonth={currentNextMonth}
          year={currentYearLabel}
          onPrev={prevMonth}
          onNext={nextMonth}
        />

        <View style={barStyles.graphButtons}>
          <Pressable
            onPress={() => setGraphType("bars")}
            style={({ pressed }) => [
              barStyles.graphButton,
              graphType === "bars" && barStyles.graphButtonActive,
              pressed && barStyles.graphButtonPressed,
            ]}
          >
            <Text
              style={[
                barStyles.graphButtonText,
                graphType === "bars" && barStyles.graphButtonTextActive,
              ]}
            >
              Barras
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setGraphType("pizza")}
            style={({ pressed }) => [
              barStyles.graphButton,
              graphType === "pizza" && barStyles.graphButtonActive,
              pressed && barStyles.graphButtonPressed,
            ]}
          >
            <Text
              style={[
                barStyles.graphButtonText,
                graphType === "pizza" && barStyles.graphButtonTextActive,
              ]}
            >
              Pizza
            </Text>
          </Pressable>
        </View>

        {graphType === "bars" ? (
          <GraphBarLayout
            data={barData}
            maxValue={maxValue}
            receitas={receitas}
            despesas={despesas}
            investimentos={investimentos}
          />
        ) : (
          <GraphPieLayout data={pizzaData} />
        )}
      </ScrollView>
      <AiChat />
    </SafeAreaView>
  );
}
