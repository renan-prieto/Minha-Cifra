import React from "react";
import { Text, View } from "react-native";

import { getSignStyles } from "../styles/stylesSign";
import { useTheme } from "@/src/contexts/ThemeContext";

export const DivisorLabel = () => {
  const { isDark } = useTheme();
  const styles = getSignStyles(isDark);

  return (
    <View style={styles.divisorContainer}>
      <View style={styles.divisor} />

      <Text style={styles.divisorText}>OU</Text>

      <View style={styles.divisor} />
    </View>
  );
};
