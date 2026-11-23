import { useTheme } from "@/src/contexts/ThemeContext";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  prevMonth: string;
  month: string;
  nextMonth: string;
  year: number;
  onPrev: () => void;
  onNext: () => void;
}

export default function MonthNavigator({
  prevMonth,
  month,
  nextMonth,
  year,
  onPrev,
  onNext,
}: Props) {
  const { isDark } = useTheme();
  const styles = getStyles(isDark);

  return (
    <View style={styles.container}>
      <View style={styles.yearBadge}>
        <Text style={styles.yearText}>{year}</Text>
      </View>

      <View style={styles.navigationRow}>
        <TouchableOpacity
          onPress={onPrev}
          style={styles.navButton}
          activeOpacity={0.7}
        >
          <Text style={styles.arrowText}>‹</Text>

          <Text style={styles.sideMonthText} numberOfLines={1}>
            {prevMonth}
          </Text>
        </TouchableOpacity>

        <View style={styles.currentMonthContainer}>
          <Text style={styles.currentMonthText} numberOfLines={1}>
            {month}
          </Text>
        </View>

        <TouchableOpacity
          onPress={onNext}
          style={styles.navButton}
          activeOpacity={0.7}
        >
          <Text style={styles.sideMonthText} numberOfLines={1}>
            {nextMonth}
          </Text>

          <Text style={styles.arrowText}>›</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      width: "100%",
      backgroundColor: isDark ? "#101E36" : "#F7F9FC",
      borderRadius: 24,
      paddingHorizontal: 16,
      paddingVertical: 14,
      marginBottom: 14,
      alignItems: "center",
    },
    yearBadge: {
      backgroundColor: isDark ? "#162844" : "#E2E8F0",
      paddingHorizontal: 12,
      paddingVertical: 3,
      borderRadius: 12,
      marginBottom: 8,
    },
    yearText: {
      fontSize: 12,
      fontWeight: "700",
      color: isDark ? "#8FC5FF" : "#006BFF",
    },
    navigationRow: {
      flexDirection: "row",
      alignItems: "center",
      width: "100%",
    },

    navButton: {
      width: 100,
      height: 40,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },

    arrowText: {
      width: 20,
      fontSize: 16,
      fontWeight: "400",
      color: isDark ? "#AEBBD0" : "#6B7280",
      textAlign: "center",
    },

    sideMonthText: {
      flex: 1,
      fontSize: 16,
      fontWeight: "600",
      color: isDark ? "#AEBBD0" : "#6B7280",
      textAlign: "center",
    },

    currentMonthContainer: {
      flex: 1,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
    },

    currentMonthText: {
      fontSize: 18,
      fontWeight: "900",
      color: isDark ? "#FFFFFF" : "#001B44",
      textAlign: "center",
    },
  });
