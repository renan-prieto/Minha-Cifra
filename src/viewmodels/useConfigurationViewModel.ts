import { router } from "expo-router";
import { useCallback, useState } from "react";
import { Alert } from "react-native";

import { useUser } from "@/src/contexts/UserContext";
import { deleteUser } from "@/src/repositories/userRepository";

/**
 * ViewModel da tela de configurações.
 * Controla o modal de exclusão de conta, o logout e os efeitos colaterais.
 */
export function useConfigurationViewModel() {
  const { user, signOut } = useUser();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const openDeleteModal = useCallback(() => setDeleteModalVisible(true), []);
  const closeDeleteModal = useCallback(() => setDeleteModalVisible(false), []);

  const handleConfirmDeleteAccount = useCallback(
    async (password: string) => {
      if (!user) {
        Alert.alert("Erro", "Usuário não encontrado.");
        return;
      }

      // O visitante não possui conta no servidor: basta encerrar a sessão local.
      if (user.isGuest) {
        setDeleteModalVisible(false);
        await signOut();

        Alert.alert(
          "Sessão de teste encerrada",
          "O modo visitante foi encerrado. Seus lançamentos de teste continuam salvos neste aparelho.",
          [
            {
              text: "OK",
              onPress: () => {
                router.replace("/(auth)/signIn");
              },
            },
          ],
        );
        return;
      }

      try {
        setDeletingAccount(true);

        await deleteUser(user.id, password);

        setDeleteModalVisible(false);
        signOut();

        Alert.alert("Conta excluída", "Sua conta foi excluída com sucesso.", [
          {
            text: "OK",
            onPress: () => {
              router.replace("/(auth)/signIn");
            },
          },
        ]);
      } catch (error: any) {
        const message =
          error?.response?.data?.error || "Não foi possível excluir sua conta.";

        Alert.alert("Erro", message);
      } finally {
        setDeletingAccount(false);
      }
    },
    [signOut, user],
  );

  const handleLogout = useCallback(() => {
    Alert.alert("Sair", "Deseja sair da conta?", [
      {
        text: "Sair",
        onPress: () => {
          signOut();
          router.replace("/(auth)/signIn");
        },
      },
      {
        text: "Cancelar",
        style: "cancel",
      },
    ]);
  }, [signOut]);

  return {
    deleteModalVisible,
    deletingAccount,
    openDeleteModal,
    closeDeleteModal,
    handleConfirmDeleteAccount,
    handleLogout,
  };
}
