import { ThemedText } from "@/src/components/expo/themed-text";
import { View } from "react-native";
import { BAR_COLORS } from "./colors";
import { getGraphLegendStyle } from "@/src/components/styles/stylesGraphLegend";
import { useTheme } from "@/src/contexts/ThemeContext";

export default function GraphLegend() {
  const { isDark } = useTheme();
  const styles = getGraphLegendStyle(isDark);

  return (
    <View style={styles.legendContainer}>
      <View style={styles.legendItem}>
        <View
          style={[styles.legendBox, { backgroundColor: BAR_COLORS.earn }]}
        />
        <ThemedText style={styles.legendText}>Ganhos</ThemedText>
      </View>

      <View style={styles.legendItem}>
        <View
          style={[styles.legendBox, { backgroundColor: BAR_COLORS.lost }]}
        />
        <ThemedText style={styles.legendText}>Gastos</ThemedText>
      </View>

      <View style={styles.legendItem}>
        <View
          style={[
            styles.legendBox,
            { backgroundColor: BAR_COLORS.investments },
          ]}
        />
        <ThemedText style={styles.legendText}>Investimentos</ThemedText>
      </View>
    </View>
  );
}
