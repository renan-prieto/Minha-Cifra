
import { Text, View } from "react-native";

import LogoHeader from "@/src/components/sign/LogoHeader";
import { getOnboardingStyles } from "@/src/components/styles/stylesOnBoarding";

type WelcomeHeroProps = {
  isDark: boolean;
};

export default function WelcomeHero({ isDark }: WelcomeHeroProps) {
  const styles = getOnboardingStyles(isDark);

  return (
    <>
      <View style={styles.heroSection}>
       <LogoHeader isDark={isDark} responsive />
      </View>

      <View style={styles.textSection}>
        <Text style={styles.subtitle}>
          Sua plataforma completa para o seu gerenciamento!
        </Text>
      </View>
    </>
  );
}
