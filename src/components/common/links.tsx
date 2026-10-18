import { useTheme } from "@/src/context/ThemeContext";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { POLITICAS, TERMOS_DE_USO } from "@/src/constants/strings";
import { default as RulesModal } from "../modal/rulesModal";
import { getSignStyles } from "../styles/stylesSign";

interface LinkLabelProps {
  onPress: () => void;
}

interface LinkTermosProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export const LinkTermos: React.FC<LinkTermosProps> = ({
  checked,
  onCheckedChange,
}) => {
  const { isDark } = useTheme();
  const styles = getSignStyles(isDark);
  const [termsVisible, setTermsVisible] = useState(false);
  const [policesVisible, setPolicesVisible] = useState(false);

  return (
    <View style={styles.termsContainer}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onCheckedChange(!checked)}
        style={[
          styles.checkbox,
          checked && styles.checkboxChecked,
        ]}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        accessibilityLabel="Aceitar termos de uso e políticas de privacidade"
      >
        {checked && (
          <Text style={styles.checkboxCheckmark}>✓</Text>
        )}
      </TouchableOpacity>

      <View style={styles.termsTextContainer}>
        <Text style={styles.termsText}>
          Li e concordo com os{" "}
        </Text>

        <Text
          style={styles.termsLink}
          onPress={() => setTermsVisible(true)}
          accessibilityRole="link"
        >
          Termos de Uso
        </Text>

        <Text style={styles.termsText}> e as </Text>

        <Text
          style={styles.termsLink}
          onPress={() => setPolicesVisible(true)}
          accessibilityRole="link"
        >
          Políticas de Privacidade
        </Text>

        <Text style={styles.termsText}>.</Text>
      </View>

      <RulesModal
        visible={termsVisible}
        isDark={isDark}
        title="Termos de uso"
        ruleText={TERMOS_DE_USO.text}
        onCancel={() => setTermsVisible(false)}
      />

      <RulesModal
        visible={policesVisible}
        isDark={isDark}
        title="Política de privacidade"
        ruleText={POLITICAS.text}
        onCancel={() => setPolicesVisible(false)}
      />
    </View>
  );
};

export const LinkPossui: React.FC<LinkLabelProps> = ({ onPress }) => {
  const { isDark } = useTheme();
  const styles = getSignStyles(isDark);

  return (
    <View style={styles.linkContainer}>
      <Text style={styles.label}>Já possui uma conta?</Text>
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <Text style={styles.link}>ENTRAR</Text>
      </TouchableOpacity>
    </View>
  );
};

export const LinkCadastro: React.FC<LinkLabelProps> = ({ onPress }) => {
  const { isDark } = useTheme();
  const styles = getSignStyles(isDark);

  return (
    <View style={styles.linkContainer}>
      <Text style={styles.label}>Não possui uma conta?</Text>
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <Text style={styles.link}>CADASTRE-SE</Text>
      </TouchableOpacity>
    </View>
  );
};