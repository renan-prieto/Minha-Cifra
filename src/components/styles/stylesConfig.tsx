import { Platform, StyleSheet } from "react-native";

export const getConfigStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 24,
      backgroundColor: isDark ? "#001B44" : "#006BFF",
    },
    title: {
      color: "#FFFFFF",
      fontSize: 30,
      fontWeight: "900",
      letterSpacing: 0.2,
      marginBottom: 8,
    },
    subtitle: {
      color: "#DCEBFF",
      fontSize: 14,
      lineHeight: 21,
      marginBottom: 22,
    },
    section: {
      backgroundColor: isDark ? "#101E36" : "#174A78",
      borderRadius: 20,
      paddingHorizontal: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: isDark ? "#1C3456" : "#4C79A0",
      ...Platform.select({
        ios: {
          shadowColor: "#001B44",
          shadowOpacity: isDark ? 0.18 : 0.16,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
        },
        android: {
          elevation: 3,
        },
      }),
    },
    sectionTitle: {
      color: isDark ? "#8FC5FF" : "#B7D8F5",
      fontSize: 12,
      fontWeight: "900",
      letterSpacing: 0.8,
      textTransform: "uppercase",
      marginTop: 16,
      marginBottom: 8,
      marginLeft: 2,
    },

    item: {
      minHeight: 78,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 14,
      marginBottom: 12,
      borderRadius: 18,
      backgroundColor: isDark ? "#101E36" : "#174A78",
      borderWidth: 1,
      borderColor: isDark ? "#263B59" : "#3C6D9A",
      ...Platform.select({
        ios: {
          shadowColor: "#001B44",
          shadowOpacity: isDark ? 0.18 : 0.12,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 3 },
        },
        android: {
          elevation: 3,
        },
      }),
    },
    itemActive: {
      borderColor: isDark ? "#3B83CC" : "#8FC5FF",
    },
    text: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "800",
    },
    itemDescription: {
      color: isDark ? "#AEBBD0" : "#D0E4F8",
      fontSize: 12,
      lineHeight: 18,
      marginTop: 4,
    },
    itemContent: {
      flex: 1,
      paddingRight: 12,
    },
    itemValue: {
      color: isDark ? "#B8CBE4" : "#C0D5E8",
      fontSize: 14,
      fontWeight: "700",
    },
    button: {
      minHeight: 56,
      justifyContent: "center",
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "#243650" : "#527DA2",
    },
    buttonText: {
      color: isDark ? "#FFFFFF" : "#F0F6FC",
      fontSize: 15,
      fontWeight: "700",
    },
    logout: {
      minHeight: 52,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: isDark ? "#371820" : "#963747",
      borderRadius: 14,
      borderWidth: 1,
      borderColor: isDark ? "#71303D" : "#B65363",
      marginTop: 10,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    logoutText: {
      color: isDark ? "#FF8F9B" : "#FFF0F1",
      fontSize: 15,
      fontWeight: "800",
    },
    divider: {
      height: 1,
      backgroundColor: isDark ? "#243650" : "#527DA2",
    },
  });