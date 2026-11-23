import { router } from "expo-router";
import { useCallback, useState } from "react";
import { Alert } from "react-native";

import { useUser } from "@/src/contexts/UserContext";
import { updateUserName } from "@/src/repositories/userRepository";

/**
 * ViewModel de edição do nome do usuário.
 */
export function useEditNameViewModel() {
  const { user, updateUser } = useUser();

  const [name, setName] = useState(user?.name ?? "");
  const [password, setPassword] = useState("");
  const isGuest = Boolean(user?.isGuest);

  const handleSave = useCallback(async () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      Alert.alert("Nome obrigatório", "Digite seu nome antes de salvar.");
      return;
    }

    if (!user?.id) {
      Alert.alert("Erro", "Não foi possível identificar o usuário.");
      return;
    }

    // O visitante não tem conta no servidor: a alteração fica só no aparelho.
    if (user.isGuest) {
      await updateUser({ ...user, name: trimmedName });
      router.back();
      return;
    }

    if (!password) {
      Alert.alert(
        "Senha obrigatória",
        "Digite sua senha atual para confirmar a alteração.",
      );
      return;
    }

    try {
      await updateUserName(user.id, trimmedName, password);
      await updateUser({ ...user, name: trimmedName });
      router.back();
    } catch (error: any) {
      Alert.alert(
        "Erro ao salvar",
        error?.response?.data?.error || "Erro ao salvar o nome.",
      );
    }
  }, [name, password, updateUser, user]);

  return {
    user,
    name,
    setName,
    password,
    setPassword,
    isGuest,
    handleSave,
  };
}
