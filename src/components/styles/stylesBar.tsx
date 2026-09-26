import { Platform, StyleSheet } from "react-native";

export const getBarStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? "#071A33" : "#006BFF",
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
      flexShrink: 1,
    },
    subtitle: {
      marginTop: 5,
      color: isDark ? "#AFC3DD" : "#E5F0FF",
      fontSize: 15,
      textAlign: "left",
      flexShrink: 1,
    },
    balanceCard: {
      width: "100%",
      backgroundColor: isDark ? "#102845" : "#FFFFFF",
      borderRadius: 24,
      paddingHorizontal: 22,
      paddingVertical: 18,
      marginBottom: 14,
    },
    balanceLabel: {
      color: isDark ? "#AFC3DD" : "#64748B",
      fontSize: 14,
      fontWeight: "600",
    },
    balanceValue: {
      marginTop: 5,
      color: isDark ? "#FFFFFF" : "#071A33",
      fontSize: 30,
      fontWeight: "900",
      flexShrink: 1,
    },
    graphCard: {
      flex: 1,
      width: "100%",
      minHeight: 460,
      backgroundColor: isDark ? "#102845" : "#FFFFFF",
      borderRadius: 24,
      paddingHorizontal: 18,
      paddingTop: 20,
      paddingBottom: 20,
      marginBottom: 14,
    },
    graphTitle: {
      color: isDark ? "#FFFFFF" : "#071A33",
      fontSize: 19,
      fontWeight: "800",
      marginBottom: 15,
      flexShrink: 1,
    },
    graphArea: {
      flex: 1,
      minHeight: 320,
      width: "100%",
      marginTop: 10,
      marginBottom: 10,
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
      backgroundColor: isDark ? "#173554" : "#F8FAFC",
      borderRadius: 18,
      padding: 14,
    },
    summaryLabel: {
      color: isDark ? "#AFC3DD" : "#64748B",
      fontSize: 12,
      marginBottom: 5,
      flexShrink: 1,
    },
    summaryValue: {
      color: isDark ? "#FFFFFF" : "#071A33",
      fontSize: 16,
      fontWeight: "800",
      flexShrink: 1,
    },
    chartContainer: {
      flex: 1,
      width: "100%",
      justifyContent: "center",
      paddingHorizontal: 10,
      paddingVertical: 10,
    },
    monthGroup: {
      flex: 1,
      width: "100%",
      alignItems: "center",
    },
    barsRow: {
      flex: 1,
      width: "100%",
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "center",
      gap: 20,
    },
    monthLabel: {
      marginTop: 12,
      fontWeight: "600",
      fontSize: 15,
    },
    noDataContainer: {
      flex: 1,
      width: "100%",
      justifyContent: "center",
      alignItems: "center",
    },
    noDataLabel: {
      color: isDark ? "#FFFFFF" : "#071A33",
    },
    graphButtons: {
      flexDirection: "row",
      justifyContent: "center",
      gap: 14,
      width: "100%",
      marginVertical: 18,
    },
    graphButton: {
      width: 145,
      height: 58,
      borderRadius: 18,
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
      gap: 8,
      backgroundColor: isDark ? "#102845" : "#EAF3FF",
      borderWidth: 2,
      borderColor: isDark ? "#315579" : "#B7D3F5",
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOpacity: isDark ? 0.22 : 0.18,
          shadowRadius: 7,
          shadowOffset: { width: 0, height: 4 },
        },
        android: {
          elevation: 5,
        },
      }),
    },
    graphButtonActive: {
      backgroundColor: "#006BFF",
      borderColor: "#006BFF",
      transform: [{ translateY: -1 }],
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOpacity: 0.28,
          shadowRadius: 9,
          shadowOffset: { width: 0, height: 5 },
        },
        android: {
          elevation: 7,
        },
      }),
    },
    graphButtonPressed: {
      transform: [{ scale: 0.94 }, { translateY: 2 }],
      opacity: 0.78,
      ...Platform.select({
        ios: {
          shadowOpacity: 0.05,
          shadowRadius: 2,
          shadowOffset: { width: 0, height: 1 },
        },
        android: {
          elevation: 1,
        },
      }),
    },
    graphButtonIcon: {
      fontSize: 21,
      fontWeight: "900",
      color: isDark ? "#B8CCE5" : "#006BFF",
    },
    graphButtonIconActive: {
      color: "#FFFFFF",
    },
    graphButtonText: {
      fontSize: 16,
      fontWeight: "800",
      color: isDark ? "#B8CCE5" : "#006BFF",
    },
    graphButtonTextActive: {
      color: "#FFFFFF",
    },
  });