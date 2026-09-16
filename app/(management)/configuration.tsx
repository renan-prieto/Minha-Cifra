import { ArrowBackHeader } from "@/src/components/common/arrowBackHeader";
import ConfigButton from "@/src/components/config/ConfigButton";
import SettingsActionButton from "@/src/components/config/SettingsActionButton";
import SettingsToggleItem from "@/src/components/config/SettingsToggleItem";
import DeleteAccountModal from "@/src/components/modal/deleteAccountModal";
import { getConfigStyles } from "@/src/components/styles/stylesConfig";
import { useTheme } from "@/src/context/ThemeContext";
import { useConfigurationActions } from "@/src/hooks/useConfigurationActions";
import { Href, router } from "expo-router";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

interface ConfigsOptions {
  text: string;
  router: Href;
}

export default function SettingsScreen() {
  const { isDark, toggleTheme } = useTheme();
  const styles = getConfigStyles(isDark);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const { handleConfirmDeleteAccount, handleLogout } = useConfigurationActions({
    setDeleteModalVisible,
    setDeletingAccount,
  });

  const ConfigsOptionsList: ConfigsOptions[] = [
    {
      text: "Gerenciar Tags",
      router: "/(management)/tags",
    },
    {
      text: "Alterar Dados",
      router: "/(management)/views/editPerfil",
    },
    {
      text: "Sobre o aplicativo",
      router: "/(management)/views/aboutApp",
    },
    {
      text: "Termos de uso",
      router: "/(management)/views/terms",
    },
    {
      text: "Política de Privacidade",
      router: "/(management)/views/policies",
    },
    {
      text: "Sobre nós",
      router: "/(management)/views/aboutUs",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ArrowBackHeader title="Configurações" route="/(tabs)/perfil" />

      <SettingsToggleItem
        label="Modo escuro"
        value={isDark}
        onValueChange={toggleTheme}
        isDark={isDark}
      />

      {ConfigsOptionsList.map((item) => (
        <ConfigButton
          key={item.text}
          text={item.text}
          onPress={() => router.replace(item.router)}
          isDark={isDark}
        />
      ))}

      <SettingsActionButton
        label="Excluir conta"
        isDark={isDark}
        variant="danger"
        onPress={() => setDeleteModalVisible(true)}
      />

      <SettingsActionButton
        label="Sair"
        isDark={isDark}
        variant="danger"
        onPress={handleLogout}
      />

      <DeleteAccountModal
        visible={deleteModalVisible}
        isDark={isDark}
        loading={deletingAccount}
        onConfirm={handleConfirmDeleteAccount}
        onCancel={() => setDeleteModalVisible(false)}
      />
    </SafeAreaView>
  );
}
