import { Platform, StyleSheet } from "react-native";

export const getSignStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: isDark ? "#001B44" : "#006BFF",
    },

    header: {
      position: "absolute",
      top: 115,
      left: 0,
      right: 0,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },

    title: {
      fontSize: 40,
      fontWeight: "900",
      fontFamily: "Poppins_800ExtraBold",
      color: "#F2EFEF",
      letterSpacing: 1,
    },

    logo: {
      width: 58,
      height: 58,
      marginLeft: 6,
      resizeMode: "contain",
    },

    card: {
      backgroundColor: isDark ? "#0B1933" : "#F7F9FC",
      minHeight: "68%",
      paddingHorizontal: 25,
      paddingTop: 35,
      paddingBottom: 55,
      borderTopLeftRadius: 55,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOpacity: 0.18,
          shadowRadius: 18,
          shadowOffset: {
            width: 0,
            height: -5,
          },
        },
        android: {
          elevation: 10,
        },
      }),
    },

    label: {
      fontSize: 14,
      fontWeight: "700",
      marginBottom: 7,
      marginLeft: 4,
      color: isDark ? "#FFFFFF" : "#1E293B",
    },

    input: {
      height: 48,
      borderRadius: 14,
      paddingHorizontal: 16,
      marginBottom: 15,
      backgroundColor: isDark ? "#122746" : "#FFFFFF",
      borderWidth: 1,
      borderColor: isDark ? "#29476F" : "#D7E2F0",
      color: isDark ? "#FFFFFF" : "#111827",
      fontSize: 14,
      ...Platform.select({
        ios: {
          shadowColor: isDark ? "#000" : "#64748B",
          shadowOpacity: 0.18,
          shadowRadius: 8,
          shadowOffset: {
            width: 0,
            height: 4,
          },
        },
        android: {
          elevation: 4,
        },
      }),
    },

    inputFocused: {
      borderWidth: 2,
      borderColor: isDark ? "#8FC5FF" : "#006BFF",
      backgroundColor: isDark ? "#1D385C" : "#FFFFFF",
      ...Platform.select({
        ios: {
          shadowColor: isDark ? "#8FC5FF" : "#006BFF",
          shadowOpacity: 0.35,
          shadowRadius: 8,
          shadowOffset: {
            width: 0,
            height: 0,
          },
        },
        android: {
          elevation: 7,
        },
      }),
    },

    buttonAuth: {
      height: 48,
      borderRadius: 14,
      backgroundColor: isDark ? "#8FC5FF" : "#006BFF",
      justifyContent: "center",
      alignItems: "center",
      marginTop: 10,
      ...Platform.select({
        ios: {
          shadowColor: isDark ? "#8FC5FF" : "#003B99",
          shadowOpacity: 0.45,
          shadowRadius: 12,
          shadowOffset: {
            width: 0,
            height: 6,
          },
        },
        android: {
          elevation: 8,
        },
      }),
    },

    textButtonAuth: {
      fontSize: 16,
      fontWeight: "800",
      color: isDark ? "#001B44" : "#FFFFFF",
    },

    subtitle: {
      textAlign: "center",
      fontSize: 14,
      marginBottom: 20,
      color: isDark ? "#DCEBFF" : "#64748B",
    },

    linkContainer: {
      flexDirection: "row",
      justifyContent: "center",
      flexWrap: "wrap",
      marginTop: 18,
    },

    link: {
      color: isDark ? "#8FC5FF" : "#006BFF",
      fontWeight: "800",
      marginLeft: 5,
    },

    divisorContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 20,
      marginBottom: 20,
    },

    divisor: {
      flex: 1,
      height: 1,
      backgroundColor: isDark ? "#29476F" : "#CBD5E1",
    },

    divisorText: {
      marginHorizontal: 12,
      fontSize: 14,
      fontWeight: "700",
      color: isDark ? "#DCEBFF" : "#64748B",
    },

        termsContainer: {
      flexDirection: "row",
      alignItems: "flex-start",
      paddingVertical: 14,
      paddingHorizontal: 14,
      marginTop: 5,
      marginBottom: 10,
      borderRadius: 16,
      backgroundColor: isDark ? "#122746" : "#FFFFFF",
      borderWidth: 1,
      borderColor: isDark ? "#29476F" : "#D7E2F0",
    },

    checkbox: {
      width: 23,
      height: 23,
      borderRadius: 7,
      borderWidth: 2,
      borderColor: isDark ? "#8FC5FF" : "#006BFF",
      backgroundColor: "transparent",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 11,
      marginTop: 1,
    },

    checkboxChecked: {
      backgroundColor: isDark ? "#8FC5FF" : "#006BFF",
      borderColor: isDark ? "#8FC5FF" : "#006BFF",
    },

    checkboxCheckmark: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "900",
      lineHeight: 18,
    },

    termsTextContainer: {
      flex: 1,
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
    },

    termsText: {
      fontSize: 13,
      lineHeight: 21,
      color: isDark ? "#DCEBFF" : "#475569",
    },

    termsLink: {
      fontSize: 13,
      lineHeight: 21,
      fontWeight: "800",
      color: isDark ? "#8FC5FF" : "#006BFF",
    },
  });
