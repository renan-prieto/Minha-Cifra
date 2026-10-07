import { ArrowBackHeader } from "@/src/components/common/arrowBackHeader";
import { getEditFieldStyles } from "@/src/components/styles/stylesEditField";
import { useTheme } from "@/src/context/ThemeContext";
import { useUser } from "@/src/context/UserContext";
import { requestPasswordReset } from "@/src/services/userService";
import { useState } from "react";
import {
  Alert,
  Keyboard,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditPasswordScreen() {
  const { isDark } = useTheme();
  const { user } = useUser();
  const styles = getEditFieldStyles(isDark);
  const [email, setEmail] = useState(user?.email ?? "");
  const [isSending, setIsSending] = useState(false);

  const handleSendLink = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      Alert.alert("E-mail obrigatório", "Digite o e-mail da sua conta.");
      return;
    }

    Keyboard.dismiss();
    setIsSending(true);
    try {
      await requestPasswordReset(normalizedEmail);
      Alert.alert(
        "Verifique seu e-mail",
        "Se houver uma conta ativa para esse endereço, enviaremos um link para redefinir a senha.",
      );
    } catch (error: any) {
      Alert.alert(
        "Não foi possível enviar",
        error?.response?.data?.error || "Tente novamente mais tarde.",
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ArrowBackHeader title="Senha" route="/(management)/views/editPerfil" />

        <View style={styles.card}>
          <View style={styles.field}>
            <Text style={styles.label}>E-mail da conta</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Digite seu e-mail"
              placeholderTextColor={isDark ? "#888" : "#999"}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              editable={!isSending}
            />
          </View>

          <Text style={styles.hint}>
            Enviaremos um link seguro para você criar uma nova senha.
          </Text>

          <TouchableOpacity
            style={[styles.saveButton, isSending && { opacity: 0.6 }]}
            onPress={handleSendLink}
            disabled={isSending}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>
              {isSending ? "Enviando..." : "Enviar link de redefinição"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
