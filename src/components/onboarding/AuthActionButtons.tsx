import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

import { getOnboardingStyles } from "@/src/components/styles/stylesOnBoarding";

type AuthActionButtonsProps = {
  isDark: boolean;
  onSignIn: () => void;
  onSignUp: () => void;
  onGuest: () => void;
};

export default function AuthActionButtons({
  isDark,
  onSignIn,
  onSignUp,
  onGuest,
}: AuthActionButtonsProps) {
  const styles = getOnboardingStyles(isDark);

  return (
    <View style={styles.cardActions}>
      <TouchableOpacity
        style={styles.buttonPrimary}
        onPress={onSignIn}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonPrimaryText}>Entrar na minha conta</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.buttonSecondary}
        onPress={onSignUp}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonSecondaryText}>Criar nova conta</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onGuest}
        activeOpacity={0.7}
        accessibilityRole="link"
        accessibilityLabel="Entrar sem conta no modo de teste"
        style={styles.guestLinkContainer}
      >
        <Text style={styles.guestLinkText}>
          Entrar sem conta (modo de teste)
        </Text>
      </TouchableOpacity>
    </View>
  );
}
