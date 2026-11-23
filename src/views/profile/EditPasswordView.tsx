import {
  Keyboard,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ArrowBackHeader } from "@/src/components/common/arrowBackHeader";
import { getEditFieldStyles } from "@/src/components/styles/stylesEditField";
import { useTheme } from "@/src/contexts/ThemeContext";
import { useEditPasswordViewModel } from "@/src/viewmodels/useEditPasswordViewModel";

export default function EditPasswordView() {
  const { isDark } = useTheme();
  const styles = getEditFieldStyles(isDark);

  const { email, setEmail, isSending, handleSendLink } =
    useEditPasswordViewModel();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ArrowBackHeader
          title="Senha"
          route="/(management)/views/editPerfil"
        />

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
              onSubmitEditing={Keyboard.dismiss}
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
