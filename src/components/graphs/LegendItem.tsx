import { ThemedText } from "@/src/components/expo/themed-text";
import { getGraphLegendStyle } from "@/src/components/styles/stylesGraphLegend";
import { useTheme } from "@/src/contexts/ThemeContext";
import { TouchableOpacity, View } from "react-native";

interface Props {
  title: string;
  value: number;
  percent: string;
  color: string;
  onPress: () => void;
}

export default function LegendItem({
  title,
  value,
  percent,
  color,
  onPress,
}: Props) {
  const { isDark } = useTheme();
  const legendStyle = getGraphLegendStyle(isDark);

  return (
    
    <TouchableOpacity style={legendStyle.legendPieItem} onPress={onPress}>
      <View style={legendStyle.legendLeft}>
        <View style={[legendStyle.colorBadge, { backgroundColor: color }]} />

        <ThemedText style={legendStyle.labelItem}>{title}</ThemedText>
      </View>

      <ThemedText style={legendStyle.labelItem} type="defaultSemiBold">
        R$ {value.toFixed(2)} ({percent}%)
      </ThemedText>
    </TouchableOpacity>
  );
}

