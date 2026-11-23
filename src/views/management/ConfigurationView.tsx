import { Href, router } from "expo-router";
import { ScrollView, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ArrowBackHeader } from "@/src/components/common/arrowBackHeader";
import ConfigButton from "@/src/components/config/ConfigButton";
import SettingsActionButton from "@/src/components/config/SettingsActionButton";
import DeleteAccountModal from "@/src/components/modal/deleteAccountModal";
import { getConfigStyles } from "@/src/components/styles/stylesConfig";
import { useTheme } from "@/src/contexts/ThemeContext";
import { useConfigurationViewModel } from "@/src/viewmodels/useConfigurationViewModel";

interface ConfigOption {
  text: string;
  router: Href;
}

const CONFIG_OPTIONS: ConfigOption[] = [
  { text: "Gerenciar Tags", router: "/(management)/tags" },
  { text: "Alterar Dados", router: "/(management)/views/editPerfil" },
  { text: "Sobre o aplicativo", router: "/(management)/views/aboutApp" },
  { text: "Termos de uso", router: "/(management)/views/terms" },
  { text: "Política de Privacidade", router: "/(management)/views/policies" },
  { text: "Sobre nós", router: "/(management)/views/aboutUs" },
];

export default function ConfigurationView() {
  const { isDark, toggleTheme } = useTheme();
  const styles = getConfigStyles(isDark);

  const {
    deleteModalVisible,
    deletingAccount,
    openDeleteModal,
    closeDeleteModal,
    handleConfirmDeleteAccount,
    handleLogout,
  } = useConfigurationViewModel();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ArrowBackHeader title="Configurações" route="/(tabs)/perfil" />

        <View
          style={[
            styles.item,
            isDark && {
              borderWidth: 1,
              borderColor: "#8FC5FF",
            },
          ]}
        >
          <Text style={styles.text}>Modo escuro</Text>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{
              false: isDark ? "#35445B" : "#8BB5E8",
              true: "#3B9BFF",
            }}
            thumbColor={isDark ? "#FFFFFF" : "#F4F8FF"}
            ios_backgroundColor={isDark ? "#35445B" : "#8BB5E8"}
          />
        </View>

        {CONFIG_OPTIONS.map((item) => (
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
          onPress={openDeleteModal}
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
          onCancel={closeDeleteModal}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
