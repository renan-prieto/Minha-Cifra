import { Redirect } from "expo-router";
import { Image, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AuthActionButtons from "@/src/components/onboarding/AuthActionButtons";
import WelcomeHero from "@/src/components/onboarding/WelcomeHero";
import { getOnboardingStyles } from "@/src/components/styles/stylesOnBoarding";
import { useTheme } from "@/src/contexts/ThemeContext";
import { useWelcomeViewModel } from "@/src/viewmodels/useWelcomeViewModel";

export default function WelcomeView() {
  const { isDark } = useTheme();
  const styles = getOnboardingStyles(isDark);

  const {
    user,
    isLoading,
    handleNavigateToSignIn,
    handleNavigateToSignUp,
    handleEnterAsGuest,
  } = useWelcomeViewModel();

  if (isLoading) {
    return null;
  }

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <WelcomeHero isDark={isDark} />

        <Image
          source={require("@/assets/images/art_modal.png")}
          style={styles.onboardingImage}
          resizeMode="contain"
        />

        <AuthActionButtons
          isDark={isDark}
          onSignIn={handleNavigateToSignIn}
          onSignUp={handleNavigateToSignUp}
          onGuest={handleEnterAsGuest}
        />
      </View>
    </SafeAreaView>
  );
}
