import { Text, View } from "react-native";

import { getCalcStyles } from "@/src/components/styles/stylesCalc";
import { useTheme } from "@/src/context/ThemeContext";

type CalculationResultCardProps = {
  salarioCopy: number;
  inss: number;
  imposto: number;
  desconto: number;
  totalDescontos: number;
  salarioLiquido: number;
  aliquotaInss: number;
  aliquotaIr: number;
  percentual: number;
  showInss: boolean;
  showIncomeTax: boolean;
};

export default function CalculationResultCard({
  salarioCopy,
  inss,
  imposto,
  desconto,
  totalDescontos,
  salarioLiquido,
  aliquotaInss,
  aliquotaIr,
  percentual,
  showInss,
  showIncomeTax,
}: CalculationResultCardProps) {
  const { isDark } = useTheme();
  const styles = getCalcStyles(isDark);

  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <View style={styles.resultCard}>
      <Text style={styles.resultTitle}>Resultado do cálculo</Text>

      <View style={styles.resultItem}>
        <Text style={styles.resultLabel}>Salário Bruto</Text>
        <Text style={styles.resultValue}>R$ {formatCurrency(salarioCopy)}</Text>
      </View>

      <View style={styles.divider} />

      {showInss && (
        <View style={styles.resultItem}>
          <Text style={styles.resultLabel}>INSS</Text>
          <Text style={styles.resultValue}>R$ {formatCurrency(inss)}</Text>
        </View>
      )}

      {showIncomeTax && (
        <>
          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>Base de Cálculo</Text>
            <Text style={styles.resultValue}>
              R$ {formatCurrency(salarioCopy - inss)}
            </Text>
          </View>

          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>Imposto Bruto</Text>
            <Text style={styles.resultValue}>R$ {formatCurrency(imposto + desconto)}</Text>
          </View>

          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>Desconto Legal</Text>
            <Text style={styles.resultValue}>R$ {formatCurrency(desconto)}</Text>
          </View>

          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>IRRF</Text>
            <Text style={styles.resultValue}>R$ {formatCurrency(imposto)}</Text>
          </View>
        </>
      )}

      <View style={styles.divider} />

      <View style={styles.highlightItem}>
        <Text style={styles.highlightLabel}>Total de Descontos</Text>
        <Text style={styles.highlightValue}>
          R$ {formatCurrency(totalDescontos)}
        </Text>
      </View>

      <View style={styles.highlightItem}>
        <Text style={styles.highlightLabel}>Salário Líquido</Text>
        <Text style={styles.netSalary}>
          R$ {formatCurrency(salarioLiquido)}
        </Text>
      </View>

      <View style={styles.divider} />

      {showInss && (
        <View style={styles.resultItem}>
          <Text style={styles.resultLabel}>Alíquota INSS</Text>
          <Text style={styles.resultValue}>{aliquotaInss.toFixed(3)}%</Text>
        </View>
      )}

      {showIncomeTax && (
        <View style={styles.resultItem}>
          <Text style={styles.resultLabel}>Alíquota IR</Text>
          <Text style={styles.resultValue}>{aliquotaIr.toFixed(3)}%</Text>
        </View>
      )}

      <View style={styles.resultItem}>
        <Text style={styles.resultLabel}>Carga Tributária</Text>
        <Text style={styles.resultValue}>{percentual.toFixed(3)}%</Text>
      </View>
    </View>
  );
}
