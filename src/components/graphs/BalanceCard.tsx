import React from "react";
import { Text, View } from "react-native";

import { getBarStyles } from "@/src/components/styles/stylesBar";
import { useTheme } from "@/src/contexts/ThemeContext";

type BalanceCardProps = {
  balance: number;
};

export default function BalanceCard({ balance }: BalanceCardProps) {
  const { isDark } = useTheme();
  const styles = getBarStyles(isDark);

  return (
    <View style={styles.balanceCard}>
      <Text style={styles.balanceLabel}>Saldo atual</Text>

      <Text style={styles.balanceValue}>
        {`R$ ${balance.toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`}
      </Text>
    </View>
  );
}
