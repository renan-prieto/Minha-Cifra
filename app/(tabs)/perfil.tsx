import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Header } from "@/src/components/common/header";
import { AiChat } from "@/src/components/common/iabox";
import AccountInfoCard from "@/src/components/profile/AccountInfoCard";
import ProfileCard from "@/src/components/profile/ProfileCard";
import ProfileSettingsButton from "@/src/components/profile/ProfileSettingsButton";
import { getProfileStyles } from "@/src/components/styles/stylesProfile";
import { useTheme } from "@/src/context/ThemeContext";
import { useUser } from "@/src/context/UserContext";
import { useProfileActions } from "@/src/hooks/useProfileActions";

export default function PerfilScreen() {
  const { isDark } = useTheme();
  const { user } = useUser();
  const styles = getProfileStyles(isDark);
  const {
    handlePickImageAsync,
    handleNavigateToConfiguration,
    handleEditProfile,
  } = useProfileActions();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Header
          title="Meu Perfil"
          subtitle="Gerencie suas informações pessoais"
        />

        <ProfileSettingsButton
          isDark={isDark}
          onPress={handleNavigateToConfiguration}
        />

        <ProfileCard
          isDark={isDark}
          user={user}
          onPickImage={handlePickImageAsync}
          onEditProfile={handleEditProfile}
        />

        <AccountInfoCard isDark={isDark} email={user?.email} />
      </ScrollView>
      <AiChat />
    </SafeAreaView>
  );
}
