import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert } from "react-native";

import { api } from "@/src/repositories/api";

/**
 * ViewModel da tela de cadastro.
 */
export function useSignUpViewModel() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleResendVerification = useCallback(async () => {
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
  }, [email]);

  const handleRegister = useCallback(async () => {
    if (!acceptedTerms) {
      Alert.alert(
        "Atenção",
        "Aceite os termos de uso e a política de privacidade para continuar.",
      );
      return;
    }

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
      const response = await api.post("/register", { email, password });

      if (response.status === 202) {
        Alert.alert(
          "Verifique seu e-mail",
          response.data.message ??
            "Enviamos um link para confirmar seu endereço de e-mail.",
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
  }, [
    acceptedTerms,
    confirmPassword,
    email,
    handleResendVerification,
    password,
    router,
  ]);

  return {
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    acceptedTerms,
    setAcceptedTerms,
    handleRegister,
  };
}
