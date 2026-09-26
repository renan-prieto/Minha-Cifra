import AuthActionButtons from "@/src/components/onboarding/AuthActionButtons";
import WelcomeHero from "@/src/components/onboarding/WelcomeHero";
import { getOnboardingStyles } from "@/src/components/styles/stylesOnBoarding";
import { useTheme } from "@/src/context/ThemeContext";
import { useOnboardingNavigation } from "@/src/hooks/useOnboardingNavigation";
import { Image, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WelcomeScreen() {
  const { isDark } = useTheme();
  const styles = getOnboardingStyles(isDark);
  const { handleNavigateToSignIn, handleNavigateToSignUp } =
    useOnboardingNavigation();

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
        />
      </View>
    </SafeAreaView>
  );
}
