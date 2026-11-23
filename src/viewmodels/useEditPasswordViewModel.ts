import { useCallback, useState } from "react";
import { Alert, Keyboard } from "react-native";

import { useUser } from "@/src/contexts/UserContext";
import { requestPasswordReset } from "@/src/repositories/userRepository";

/**
 * ViewModel de redefinição de senha por e-mail.
 */
export function useEditPasswordViewModel() {
  const { user } = useUser();

  const [email, setEmail] = useState(user?.email ?? "");
  const [isSending, setIsSending] = useState(false);

  const handleSendLink = useCallback(async () => {
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
  }, [email]);

  return {
    email,
    setEmail,
    isSending,
    handleSendLink,
  };
}
