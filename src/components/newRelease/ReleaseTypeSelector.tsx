import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

import { getNewReleaseStyles } from "@/src/components/styles/stylesNewRelease";
import { ReleaseType } from "@/src/hooks/useNewReleaseActions";

type ReleaseTypeSelectorProps = {
  type: ReleaseType;
  isDark: boolean;
  onChangeType: (newType: ReleaseType) => void;
};

export default function ReleaseTypeSelector({
  type,
  isDark,
  onChangeType,
}: ReleaseTypeSelectorProps) {
  const styles = getNewReleaseStyles(isDark);

  return (
    <View style={styles.typeContainer}>
      <TouchableOpacity
        style={[
          styles.typeButton,
          type === "earn" && styles.typeButtonEarnActive,
        ]}
        onPress={() => onChangeType("earn")}
        activeOpacity={0.7}
      >
        <Feather
          name="arrow-up-right"
          size={18}
          color={
            type === "earn"
              ? isDark
                ? "#4ADE80"
                : "#2E7D32"
              : isDark
                ? "#64748B"
                : "#94A3B8"
          }
        />
        <Text
          style={[
            styles.typeText,
            type === "earn" && styles.typeTextEarnActive,
          ]}
        >
          Ganho
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.typeButton,
          type === "investiments" && styles.typeButtonInvestmentsActive,
        ]}
        onPress={() => onChangeType("investiments")}
        activeOpacity={0.7}
      >
        <Feather
          name="trending-up"
          size={18}
          color={
            type === "investiments"
              ? isDark
                ? "#60A5FA"
                : "#1E88E5"
              : isDark
                ? "#64748B"
                : "#94A3B8"
          }
        />
        <Text
          style={[
            styles.typeText,
            type === "investiments" && styles.typeTextInvestmentsActive,
          ]}
        >
          Inves.
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.typeButton,
          type === "lost" && styles.typeButtonLostActive,
        ]}
        onPress={() => onChangeType("lost")}
        activeOpacity={0.7}
      >
        <Feather
          name="arrow-down-left"
          size={18}
          color={
            type === "lost"
              ? isDark
                ? "#F87171"
                : "#C62828"
              : isDark
                ? "#64748B"
                : "#94A3B8"
          }
        />
        <Text
          style={[
            styles.typeText,
            type === "lost" && styles.typeTextLostActive,
          ]}
        >
          Despesa
        </Text>
      </TouchableOpacity>
    </View>
  );
}
