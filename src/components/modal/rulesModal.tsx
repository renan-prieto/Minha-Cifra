import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

interface RulesModalProps {
  visible: boolean;
  isDark: boolean;
  onCancel: () => void;
  title: string;
  ruleText: string;
}

export default function RulesModal({
  visible,
  isDark,
  title,
  ruleText,
  onCancel,
}: RulesModalProps) {
  const handleCancel = () => {
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.container,
            { backgroundColor: isDark ? "#0B1933" : "#FFFFFF" },
          ]}
        >
          <Text style={[styles.title, { color: isDark ? "#FFFFFF" : "#11181C" }]}>
            {title}
          </Text>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator
          >
            <Text
              style={[
                styles.description,
                { color: isDark ? "#D4DCE8" : "#4B5563" },
              ]}
            >
              {ruleText.trim()}
            </Text>
          </ScrollView>

          <TouchableOpacity
            onPress={handleCancel}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel="Fechar modal"
          >
            <Text style={styles.closeText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 20,
  },
  container: {
    width: "100%" as const,
    maxWidth: 400,
    maxHeight: "85%" as const,
    borderRadius: 16,
    padding: 20,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold" as const,
    marginBottom: 14,
  },
  content: {
    flexShrink: 1,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    paddingRight: 8,
  },
  closeButton: {
    alignSelf: "flex-end" as const,
    backgroundColor: "#006BFF",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    marginTop: 16,
  },
  closeText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold" as const,
  },
});
