import { StyleSheet } from "react-native";

export const getPizzaStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? "#001B44" : "#006BFF",
    },
    content: {
      flexGrow: 1,
      paddingHorizontal: 20,
      paddingTop: 15,
      paddingBottom: 20,
    },
    header: {
      marginBottom: 15,
      alignItems: "flex-start",
    },
    title: {
      color: "#FFFFFF",
      fontSize: 32,
      fontWeight: "900",
      letterSpacing: 0.5,
      textAlign: "left",
    },
    subtitle: {
      marginTop: 5,
      color: isDark ? "#B8C7DD" : "#DCEAFF",
      fontSize: 15,
      textAlign: "left",
    },
    balanceCard: {
      backgroundColor: isDark ? "#101E36" : "#F7F9FC",
      borderRadius: 24,
      paddingHorizontal: 22,
      paddingVertical: 18,
      marginBottom: 14,
    },
    balanceLabel: {
      color: isDark ? "#AEBBD0" : "#6B7280",
      fontSize: 14,
      fontWeight: "600",
    },
    balanceValue: {
      marginTop: 5,
      color: isDark ? "#FFFFFF" : "#001B44",
      fontSize: 30,
      fontWeight: "900",
    },
    pizzaCard: {
      flex: 1,
      minHeight: 480,
      backgroundColor: isDark ? "#102845" : "#FFFFFF",
      borderRadius: 24,
      paddingHorizontal: 18,
      paddingTop: 20,
      paddingBottom: 20,
      marginBottom: 14,
    },
    pizzaTitle: {
      color: isDark ? "#FFFFFF" : "#001B44",
      fontSize: 19,
      fontWeight: "800",
      marginBottom: 15,
    },
    pizzaArea: {
      flex: 1,
      color: isDark ? "#FFFFFF" : "#001B44",
      minHeight: 300,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 5,
      marginBottom: 5,
    },
    legend: {
      width: "100%",
      color: isDark ? "#FFFFFF" : "#001B44",
      marginTop: 10,
      transform: [{ scale: 0.95 }],
    },
    legendItem: {
      flexDirection: "row",
      color: isDark ? "#FFFFFF" : "#001B44",
      alignItems: "center",
      marginBottom: 12,
    },
    legendBox: {
      width: 15,
      color: isDark ? "#FFFFFF" : "#001B44",
      height: 15,
      borderRadius: 4,
      marginRight: 8,
    },
    legendText: {
      color: isDark ? "#FFFFFF" : "#001B44",
      fontSize: 14,
      fontWeight: "600",
    },
    summary: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 10,
      width: "100%",
    },
    summaryCard: {
      flex: 1,
      minWidth: 0,
      backgroundColor: isDark ? "#162844" : "#FFFFFF",
      borderRadius: 18,
      padding: 14,
    },
    summaryLabel: {
      color: isDark ? "#FFFFFF" : "#162844",
      fontSize: 12,
      marginBottom: 5,
    },
    summaryValue: {
      color: isDark ? "#FFFFFF" : "#001B44",
      fontSize: 16,
      fontWeight: "800",
      flexShrink: 1,
    },
    instructionText: {
      marginTop: 15,
      marginBottom: 5,
      fontSize: 12,
      fontStyle: "italic",
      color: "#FFFFFF",
      textAlign: "center",
    },
    chartWrapper: {
      justifyContent: "center",
      alignItems: "center",
      marginVertical: 10,
      height: 240,
    },

    noDataContainer: {
      justifyContent: "center",
      alignItems: "center",
      height: 240,
    },
    noDataLabel: {
      color: isDark ? "#FFFFFF" : "#001B44",
    },
  });
