import { Platform, StyleSheet } from "react-native";

export const getOnboardingStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: isDark ? "#001B44" : "#006BFF",
    },

    content: {
      flex: 1,
      justifyContent: "space-between",
    },

    heroSection: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 24,
      paddingTop: 40,
    },

    logoContainer: {
      width: 90,
      height: 90,
      borderRadius: 45,
      backgroundColor: isDark ? "#101E36" : "#FFFFFF",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 20,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOpacity: 0.2,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
        },
        android: {
          elevation: 6,
        },
      }),
    },

    textSection: {
      alignItems: "flex-end",
    },

    title: {
      fontSize: 38,
      fontWeight: "900",
      fontFamily: "Poppins_800ExtraBold",
      color: "#F2EFEF",
      letterSpacing: 1,
      marginBottom: 8,
    },

    subtitle: {
      fontSize: 18,
      fontWeight: "600",
      textAlign: "center",
      color: isDark ? "#D6E5FA" : "#F0F6FF",
      paddingHorizontal: 20,
      marginBottom: 1,
      lineHeight: 26,
      letterSpacing: 0.3,
    },

    cardActions: {
      backgroundColor: isDark ? "#101E36" : "#F7F9FC",
      paddingHorizontal: 25,
      paddingTop: 40,
      paddingBottom: 50,
      borderTopLeftRadius: 55,
      gap: 14,
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

    buttonPrimary: {
      height: 52,
      borderRadius: 14,
      backgroundColor: isDark ? "#8FC5FF" : "#006BFF",
      justifyContent: "center",
      alignItems: "center",
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

    buttonPrimaryText: {
      fontSize: 16,
      fontWeight: "800",
      color: isDark ? "#001B44" : "#FFFFFF",
    },

    buttonSecondary: {
      height: 52,
      borderRadius: 14,
      backgroundColor: isDark ? "#172A46" : "#FFFFFF",
      borderWidth: 1.5,
      borderColor: isDark ? "#29476F" : "#D7E2F0",
      justifyContent: "center",
      alignItems: "center",
      ...Platform.select({
        ios: {
          shadowColor: isDark ? "#000" : "#64748B",
          shadowOpacity: 0.1,
          shadowRadius: 6,
          shadowOffset: {
            width: 0,
            height: 2,
          },
        },
        android: {
          elevation: 3,
        },
      }),
    },

    buttonSecondaryText: {
      fontSize: 16,
      fontWeight: "800",
      color: isDark ? "#8FC5FF" : "#006BFF",
    },

    onboardingImage: {
      width: "100%",
      height: 450,
      marginTop: 0,
      marginBottom: -20,
    },
  });
