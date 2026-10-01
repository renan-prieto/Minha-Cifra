import { ArrowBackHeader } from "@/src/components/common/arrowBackHeader";
import SettingsToggleItem from "@/src/components/config/SettingsToggleItem";
import { getConfigStyles } from "@/src/components/styles/stylesConfig";
import { useTaxSettings } from "@/src/context/TaxSettingsContext";
import { useTheme } from "@/src/context/ThemeContext";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TaxSettingsScreen() {
  const { isDark } = useTheme();
  const { taxes, setTaxEnabled } = useTaxSettings();
  const styles = getConfigStyles(isDark);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ArrowBackHeader
          title="Impostos da calculadora"
          route="/(tabs)/calculator"
        />

        <SettingsToggleItem
          label="INSS"
          value={taxes.inss}
          onValueChange={(enabled) => setTaxEnabled("inss", enabled)}
          isDark={isDark}
        />

        <SettingsToggleItem
          label="Imposto de Renda (IRRF)"
          value={taxes.irrf}
          onValueChange={(enabled) => setTaxEnabled("irrf", enabled)}
          isDark={isDark}
        />
      </ScrollView>
    </SafeAreaView>
  );
}