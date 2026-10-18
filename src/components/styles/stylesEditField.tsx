import { StyleSheet } from "react-native";

export const getEditFieldStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? "#001B44" : "#006BFF",
    },
    content: {
      flexGrow: 1,
      paddingHorizontal: 20,
      paddingTop: 15,
      paddingBottom: 30,
    },
    card: {
      width: "100%",
      backgroundColor: isDark ? "#101E36" : "#F7F9FC",
      borderRadius: 24,
      paddingHorizontal: 20,
      paddingVertical: 22,
    },
    field: {
      gap: 10,
    },
    label: {
      color: isDark ? "#AEBBD0" : "#475569",
      fontSize: 13,
      fontWeight: "700",
    },
    input: {
      width: "100%",
      height: 52,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: isDark ? "#243653" : "#DCE3ED",
      backgroundColor: isDark ? "#162844" : "#FFFFFF",
      color: isDark ? "#FFFFFF" : "#001B44",
      paddingHorizontal: 16,
      fontSize: 15,
      fontWeight: "600",
    },
    inputPassword: {
      width: "100%",
      height: 52,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: isDark ? "#243653" : "#DCE3ED",
      backgroundColor: isDark ? "#162844" : "#FFFFFF",
      color: isDark ? "#FFFFFF" : "#001B44",
      paddingHorizontal: 16,
      fontSize: 15,
      fontWeight: "600",
    },
    hint: {
      color: isDark ? "#8FC5FF" : "#006BFF",
      fontSize: 12,
      fontWeight: "600",
      marginTop: 8,
    },
    saveButton: {
      marginTop: 24,
      height: 52,
      borderRadius: 14,
      backgroundColor: isDark ? "#8FC5FF" : "#006BFF",
      justifyContent: "center",
      alignItems: "center",
    },
    saveButtonText: {
      color: isDark ? "#001B44" : "#FFFFFF",
      fontSize: 16,
      fontWeight: "800",
    },
  });
