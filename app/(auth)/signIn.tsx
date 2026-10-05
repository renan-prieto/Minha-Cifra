import LoginForm from "@/src/components/sign/LoginForm";
import LogoHeader from "@/src/components/sign/LogoHeader";
import { getSignStyles } from "@/src/components/styles/stylesSign";
import { useTheme } from "@/src/context/ThemeContext";
import { useUser } from "@/src/context/UserContext";
import User from "@/src/model/User";
import { api } from "@/src/services/api";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, View } from "react-native";

export default function SignIn() {
  const { isDark } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signIn } = useUser();

  const styles = getSignStyles(isDark);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert("Erro", "Preencha todos os campos.");
      return;
    }

    try {
      const userCredentials = new User(email, password);

      await signIn(userCredentials);

      Alert.alert("Sucesso", "Seja bem vindo!");
      router.replace("/(tabs)");
    } catch (error: any) {
      if (error.response?.data?.code === "EMAIL_NOT_VERIFIED") {
        Alert.alert(
          "Confirme seu e-mail",
          error.response.data.error,
          [
            { text: "Agora não", style: "cancel" },
            {
              text: "Reenviar link",
              onPress: async () => {
                try {
                  await api.post("/resend-verification", { email });
                  Alert.alert(
                    "Solicitação recebida",
                    "Se houver uma conta pendente para este endereço, enviaremos um novo link.",
                  );
                } catch {
                  Alert.alert("Erro", "Não foi possível solicitar outro link agora.");
                }
              },
            },
          ],
        );
        return;
      }

      const errorMsg =
        error.response?.data?.error ?? "Erro ao conectar com o servidor.";

      Alert.alert("Erro na Autenticação", errorMsg);
    }
  }

  return (
    <View style={styles.container}>
      <LogoHeader isDark={isDark} />
      <LoginForm
        isDark={isDark}
        email={email}
        password={password}
        setEmail={setEmail}
        setPassword={setPassword}
        onLogin={handleLogin}
      />
    </View>
  );
}
