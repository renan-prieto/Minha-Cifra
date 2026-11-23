import React from "react";
import { Text, View } from "react-native";

import { getProfileStyles } from "@/src/components/styles/stylesProfile";

type AccountInfoCardProps = {
  isDark: boolean;
  email?: string;
  isGuest?: boolean;
};

export default function AccountInfoCard({
  isDark,
  email,
  isGuest = false,
}: AccountInfoCardProps) {
  const styles = getProfileStyles(isDark);

  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoTitle}>Informações da conta</Text>

      {isGuest ? (
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Sessão</Text>
          <Text style={styles.infoValue}>
            Modo visitante (teste) — sem conta
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{email}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Senha</Text>
            <Text style={styles.infoValue}>••••••••</Text>
          </View>
        </>
      )}
    </View>
  );
}
