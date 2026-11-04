import { Text, TextInput, TouchableOpacity, View } from "react-native";

import { getCalcStyles } from "@/src/components/styles/stylesCalc";
import { useTheme } from "@/src/context/ThemeContext";

type SalaryInputCardProps = {
  salario: string;
  focused: boolean;
  onChangeSalario: (value: string) => void;
  onFocus: (value: boolean) => void;
  onCalculate: () => void;
};

export default function SalaryInputCard({
  salario,
  focused,
  onChangeSalario,
  onFocus,
  onCalculate,
}: SalaryInputCardProps) {
  const { isDark } = useTheme();
  const styles = getCalcStyles(isDark);

  return (
    <View style={styles.inputCard}>
      <Text style={styles.inputLabel}>Salário Bruto</Text>

      <TextInput
        keyboardType="numeric"
        value={salario}
        onFocus={() => onFocus(true)}
        onBlur={() => onFocus(false)}
        onChangeText={onChangeSalario}
        placeholder="Digite seu salário"
        placeholderTextColor={isDark ? "#888" : "#999"}
        selectionColor="#2563EB"
        style={[styles.input, focused && styles.inputFocused]}
      />

      <TouchableOpacity style={styles.calculateButton} onPress={onCalculate}>
        <Text style={styles.calculateButtonText}>Calcular</Text>
      </TouchableOpacity>
    </View>
  );
}
