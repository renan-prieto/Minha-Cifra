import { useTheme } from "@/src/context/ThemeContext";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { POLITICAS, TERMOS_DE_USO } from "@/src/constants/strings";
import { Checkbox } from 'expo-checkbox';
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
    <View style={styles.linkContainer}>
      <Checkbox value={checked} onValueChange={onCheckedChange} />
      <Text style={styles.label}>
        Eu li e concordo com os
      </Text>
      <TouchableOpacity onPress={() => setTermsVisible(true)}>
        <Text style={styles.link}>TERMOS DE USO</Text>
      </TouchableOpacity>


      <Text style={styles.label}>&</Text>
      <TouchableOpacity onPress={() => setPolicesVisible(true)}>
        <Text style={styles.link}>POLÍTICAS DE PRIVACIDADE</Text>
      </TouchableOpacity>

      {termsVisible && (
        <RulesModal
          visible={termsVisible}
          isDark={isDark}
          title="Termos de uso"
          ruleText={TERMOS_DE_USO.text}
          onCancel={() => setTermsVisible(false)}
        />
      )}
      {policesVisible && (
        <RulesModal
          visible={policesVisible}
          isDark={isDark}
          title="Política de privacidade"
          ruleText={POLITICAS.text}
          onCancel={() => setPolicesVisible(false)}
        />
      )}



      
    </View>
  );
};

export const LinkPossui: React.FC<LinkLabelProps> = ({ onPress }) => {
  const { isDark } = useTheme();
  const styles = getSignStyles(isDark);

  return (
    <View style={styles.linkContainer}>
      <Text style={styles.label}>Já possui uma conta?</Text>
      <TouchableOpacity onPress={onPress}>
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
      <TouchableOpacity onPress={onPress}>
        <Text style={styles.link}>CADASTRE-SE</Text>
      </TouchableOpacity>
    </View>
  );
};
