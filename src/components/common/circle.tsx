import { ThemedText } from "@/src/components/expo/themed-text";
import { useFinance } from "@/src/contexts/FinanceContext";
import { useGraphicFilter } from "@/src/viewmodels/useGraphicFilter";
import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

const radius = 35;
const circumference = 2 * Math.PI * radius;

const Graph = () => {
  const { currentMonthLabel, currentYearLabel } = useGraphicFilter();
  const { itemsLost } = useFinance();

  const filteredGraphic: { id: string; title: string; value: number }[] =
    itemsLost
      .filter(
        (item) =>
          item.month === currentMonthLabel && item.year === currentYearLabel,
      )
      .map((item) => ({
        id: item.id,
        title: item.tag,
        value: item.value,
      }));

  const colors = [
    "#FF3B30",
    "#FF9500",
    "#FFCC00",
    "#34C759",
    "#30B0C7",
    "#007AFF",
    "#5856D6",
    "#AF52DE",
  ];

  const totalValue = filteredGraphic.reduce((sum, item) => sum + item.value, 0);

  return (
    <View style={styles.chartWrapper}>
      {filteredGraphic.length > 0 && totalValue > 0 ? (
        <Svg width="160" height="160" viewBox="0 0 160 160">
          {(() => {
            let accumulated = 0;

            return filteredGraphic.map((item, index) => {
              const percentage = item.value / totalValue;
              const strokeLength = circumference * percentage;

              const circle = (
                <Circle
                  key={item.id}
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="transparent"
                  stroke={colors[index % colors.length]}
                  strokeWidth={radius * 2}
                  strokeDasharray={`${strokeLength} ${circumference}`}
                  strokeDashoffset={-accumulated}
                  strokeLinecap="butt"
                  transform="rotate(-90 80 80)"
                />
              );

              accumulated += strokeLength;

              return circle;
            });
          })()}
        </Svg>
      ) : (
        <View style={styles.noDataContainer}>
          <ThemedText type="default">
            Sem gastos registrados neste mês.
          </ThemedText>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  controlContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 15,
  },
  navButton: { paddingHorizontal: 20, paddingVertical: 5 },
  monthTitle: { minWidth: 120, textAlign: "center" },
  chartWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
    height: 160,
  },
  noDataContainer: {
    height: 160,
    justifyContent: "center",
    alignItems: "center",
  },
  legendSection: { marginTop: 10 },
  legendTitle: { marginBottom: 15 },
  legendItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  legendLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  colorBadge: { width: 14, height: 14, borderRadius: 7 },
  footerInstruction: { marginTop: 25 },
  instructionText: { fontSize: 12, fontStyle: "italic", color: "#8E8E93" },
});

export default Graph;
