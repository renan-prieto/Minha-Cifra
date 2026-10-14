import { getHomeStyles } from "@/src/components/styles/stylesHome";
import { useTheme } from "@/src/context/ThemeContext";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export const AiChat = () => {
  const { isDark } = useTheme();
  const styles = getHomeStyles(isDark);
  const router = useRouter();

  return (
      <TouchableOpacity
        accessibilityLabel="Abrir assistente financeiro"
        accessibilityRole="button"
        onPress={() => router.push("/(ia)/chat")}
        style={styles.chatEntryCard}
      >
        <View style={styles.chatEntryIcon}>
          <Feather name="message-circle" size={21} color="#FFFFFF" />
        </View>
        <View style={styles.chatEntryCopy}>
          <Text style={styles.chatEntryTitle}>Assistente IA</Text>
        </View>
      </TouchableOpacity>
  );
}
