
import { getConfigStyles } from "@/src/components/styles/stylesConfig";
import { Switch, Text, View } from "react-native";

type SettingsToggleItemProps = {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  isDark: boolean;
};

export default function SettingsToggleItem({
  label,
  value,
  onValueChange,
  isDark,
}: SettingsToggleItemProps) {
  const styles = getConfigStyles(isDark);

  return (
    <View style={[styles.item, value && styles.itemActive]}>
      <View style={styles.itemContent}>
        <Text style={styles.text}>{label}</Text>
        <Text style={styles.itemDescription}>
          {value ? "Imposto incluído no cálculo" : "Imposto desativado"}
        </Text>
      </View>

      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: isDark ? "#35445B" : "#8BB5E8",
          true: "#3B9BFF",
        }}
        thumbColor={value ? "#FFFFFF" : isDark ? "#B8C7DA" : "#F4F8FF"}
        ios_backgroundColor={isDark ? "#35445B" : "#8BB5E8"}
        accessibilityLabel={label}
        accessibilityRole="switch"
      />
    </View>
  );
}
