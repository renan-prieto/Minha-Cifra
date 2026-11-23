import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScrollView, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CalculationResultCard from "@/src/components/calculator/CalculationResultCard";
import SalaryInputCard from "@/src/components/calculator/SalaryInputCard";
import { Header } from "@/src/components/common/header";
import { AiChat } from "@/src/components/common/iabox";
import { getCalcStyles } from "@/src/components/styles/stylesCalc";
import { useTheme } from "@/src/contexts/ThemeContext";
import { useCalculatorViewModel } from "@/src/viewmodels/useCalculatorViewModel";

export default function CalculatorView() {
  const { isDark } = useTheme();
  const styles = getCalcStyles(isDark);

  const {
    taxes,
    salario,
    setSalario,
    salarioCopy,
    inss,
    imposto,
    desconto,
    focused,
    setFocused,
    handleCalculate,
    result,
  } = useCalculatorViewModel();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Header
          title="Calculadora de Imposto de Renda Mensal"
          subtitle="Calcule seus descontos e veja seu salário líquido"
        />

        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => router.push("/(management)/taxes")}
          style={styles.taxSettingsButton}
        >
          <Feather
            name="sliders"
            size={18}
            color={isDark ? "#FFFFFF" : "#001B44"}
          />
          <Text style={styles.taxSettingsButtonText}>Configurar impostos</Text>
        </TouchableOpacity>

        <SalaryInputCard
          salario={salario}
          focused={focused}
          onChangeSalario={setSalario}
          onFocus={setFocused}
          onCalculate={() => handleCalculate()}
        />

        <CalculationResultCard
          salarioCopy={salarioCopy}
          inss={inss}
          imposto={imposto}
          desconto={desconto}
          totalDescontos={result.totalDescontos}
          salarioLiquido={result.salarioLiquido}
          aliquotaInss={result.aliquotaInss}
          aliquotaIr={result.aliquotaIr}
          percentual={result.percentual}
          showInss={taxes.inss}
          showIncomeTax={taxes.irrf}
        />
      </ScrollView>
      <AiChat />
    </SafeAreaView>
  );
}
