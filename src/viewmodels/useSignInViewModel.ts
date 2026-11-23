import { router } from "expo-router";
import { useCallback, useState } from "react";
import { Alert } from "react-native";

import { useUser } from "@/src/contexts/UserContext";
import User from "@/src/models/User";
import { api } from "@/src/repositories/api";

/**
 * ViewModel da tela de login.
 */
export function useSignInViewModel() {
  const { signIn, enterAsGuest } = useUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const resendVerification = useCallback(async () => {
    try {
      await api.post("/resend-verification", { email });
      Alert.alert(
        "Solicitação recebida",
        "Se houver uma conta pendente para este endereço, enviaremos um novo link.",
      );
    } catch {
      Alert.alert("Erro", "Não foi possível solicitar outro link agora.");
    }
  }, [email]);

  const handleLogin = useCallback(async () => {

    if (!email || !password) {
      Alert.alert("Erro", "Preencha todos os campos.");
      return;
    }

    try {
      await signIn(new User(email, password));

      Alert.alert("Sucesso", "Seja bem vindo!");
      router.replace("/(tabs)");
    } catch (error: any) {
      if (error.response?.data?.code === "EMAIL_NOT_VERIFIED") {
        Alert.alert("Confirme seu e-mail", error.response.data.error, [
          { text: "Agora não", style: "cancel" },
          {
            text: "Reenviar link",
            onPress: () => void resendVerification(),
          },
        ]);
        return;
      }

      const errorMsg =
        error.response?.data?.error ?? "Erro ao conectar com o servidor.";

      Alert.alert("Erro na Autenticação", errorMsg);
    }
  }, [email, password, resendVerification, signIn]);

  const handleGuestLogin = useCallback(async () => {
    try {
      await enterAsGuest();
      router.replace("/(tabs)");
    } catch {
      Alert.alert(
        "Erro",
        "Não foi possível iniciar a sessão de teste. Tente novamente.",
      );
    }
  }, [enterAsGuest]);

  return {
    email,
    setEmail,
    password,
    setPassword,
    handleLogin,
    handleGuestLogin,
  };
}
