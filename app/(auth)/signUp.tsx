import LogoHeader from "@/src/components/sign/LogoHeader";
import RegisterForm from "@/src/components/sign/RegisterForm";
import { getSignStyles } from "@/src/components/styles/stylesSign";
import { useTheme } from "@/src/context/ThemeContext";
import { api } from "@/src/services/api";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, View } from "react-native";

export default function SignUp() {
  const { isDark } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const styles = getSignStyles(isDark);

  const router = useRouter();

  async function handleResendVerification() {
    try {
      const response = await api.post("/resend-verification", { email });
      Alert.alert(
        "Verifique seu e-mail",
        response.data.message ?? "Solicitação de reenvio realizada.",
      );
    } catch (error: any) {
      Alert.alert(
        "Falha no envio",
        error.response?.data?.error ?? "Não foi possível reenviar o e-mail agora.",
      );
    }
  }

  async function handleRegister() {
    if (!email || !password || !confirmPassword) {
      Alert.alert("Erro", "Preencha todos os campos!");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Erro", "Senhas não coincidem!");
      return;
    }

    if (password.length < 8) {
      Alert.alert("Erro", "Senha muito curta! Mínimo de 8 caracteres.");
      return;
    }

    try {
      const response = await api.post("/register", {
        email,
        password,
      });

      if (response.status === 202) {
        Alert.alert(
          "Verifique seu e-mail",
          response.data.message ?? "Enviamos um link para confirmar seu endereço de e-mail.",
        );

        router.replace("/signIn");
      }
    } catch (error: any) {
      const msg =
        error.response?.data?.error ?? "Erro ao conectar com o servidor";

      if (error.response?.data?.code === "EMAIL_SEND_FAILED") {
        Alert.alert("Cadastro criado", msg, [
          { text: "Agora não", style: "cancel" },
          {
            text: "Reenviar confirmação",
            onPress: () => void handleResendVerification(),
          },
        ]);
        return;
      }

      Alert.alert("Erro no Cadastro", msg);
    }
  }

  return (
    <View style={styles.container}>
      <LogoHeader isDark={isDark} />

      <RegisterForm
        isDark={isDark}
        email={email}
        password={password}
        confirmPassword={confirmPassword}
        setEmail={setEmail}
        setPassword={setPassword}
        setConfirmPassword={setConfirmPassword}
        onRegister={handleRegister}
      />
    </View>
  );
}
