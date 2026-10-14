import { Platform, StyleSheet } from "react-native";

export const getHomeStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? "#001B44" : "#006BFF",
    },

    header: {
      paddingHorizontal: 22,
      paddingTop: 25,
      paddingBottom: 35,
    },

    welcome: {
      fontSize: 26,
      fontWeight: "900",
      color: "#FFFFFF",
      fontFamily: "sans-serif",
    },

    subtitle: {
      marginTop: 6,
      fontSize: 14,
      color: "#DCEBFF",
    },

    content: {
      flex: 1,
      backgroundColor: isDark ? "#0B1933" : "#F7F9FC",
      borderTopLeftRadius: 45,
      padding: 20,
    },
    contentContainer: {
      paddingBottom: 88,
    },
    balanceCard: {
      width: "100%",
      backgroundColor: isDark ? "#101E36" : "#F7F9FC",
      borderRadius: 24,
      paddingHorizontal: 22,
      paddingVertical: 18,
      marginBottom: 14,
      alignItems: "flex-end",
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
      flexShrink: 1,
    },
    chatEntryCard: {
      position: "absolute",
      right: 18,
      bottom: 16,
      minHeight: 62,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingHorizontal: 12,
      paddingVertical: 9,
      borderRadius: 18,
      backgroundColor: isDark ? "#101E36" : "#FFFFFF",
      zIndex: 10,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOpacity: 0.2,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 5 },
        },
        android: { elevation: 8 },
      }),
    },
    chatEntryIcon: {
      width: 42,
      height: 42,
      borderRadius: 13,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark ? "#2563EB" : "#006BFF",
    },
    chatEntryCopy: { gap: 2 },
    chatEntryTitle: {
      color: isDark ? "#FFFFFF" : "#001B44",
      fontSize: 14,
      fontWeight: "800",
    },
    chatEntryDescription: {
      color: isDark ? "#AEBBD0" : "#6B7280",
      fontSize: 11,
      lineHeight: 15,
    },
    card: {
      backgroundColor: isDark ? "#122746" : "#FFFFFF",
      borderRadius: 18,
      padding: 16,
      marginBottom: 18,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOpacity: 0.15,
          shadowRadius: 12,
          shadowOffset: {
            width: 0,
            height: 5,
          },
        },
        android: {
          elevation: 5,
        },
      }),
    },

    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },

    cardTitle: {
      fontSize: 16,
      fontWeight: "800",
      color: isDark ? "#FFFFFF" : "#1E293B",
    },

    cardValue: {
      fontSize: 14,
      fontWeight: "800",
      color: isDark ? "#8FC5FF" : "#006BFF",
    },

    item: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 7,
    },

    itemText: {
      fontSize: 14,
      color: isDark ? "#DCEBFF" : "#475569",
    },

    itemValue: {
      fontSize: 14,
      fontWeight: "700",
      color: isDark ? "#FFFFFF" : "#1E293B",
    },

    button: {
      height: 36,
      borderRadius: 10,
      backgroundColor: isDark ? "#8FC5FF" : "#006BFF",
      justifyContent: "center",
      alignItems: "center",
      marginTop: 14,
      ...Platform.select({
        ios: {
          shadowColor: "#006BFF",
          shadowOpacity: 0.3,
          shadowRadius: 8,
          shadowOffset: {
            width: 0,
            height: 4,
          },
        },
        android: {
          elevation: 5,
        },
      }),
    },

    buttonText: {
      fontSize: 13,
      fontWeight: "800",
      color: isDark ? "#001B44" : "#FFFFFF",
    },
  });
