import { KeyboardAvoidingView, ScrollView, View } from "react-native";

import LoginForm from "@/src/components/sign/LoginForm";
import LogoHeader from "@/src/components/sign/LogoHeader";
import { getSignStyles } from "@/src/components/styles/stylesSign";
import { useTheme } from "@/src/contexts/ThemeContext";
import { useSignInViewModel } from "@/src/viewmodels/useSignInViewModel";

export default function SignInView() {
  const { isDark } = useTheme();
  const styles = getSignStyles(isDark);

  const {
    email,
    setEmail,
    password,
    setPassword,
    handleLogin,
    handleGuestLogin,
  } = useSignInViewModel();

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.container}>
      <LogoHeader isDark={isDark} />

      <ScrollView
        style={styles.formScroll}
        contentContainerStyle={styles.formScrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.formSpacer} />
        <LoginForm
          isDark={isDark}
          email={email}
          password={password}
          setEmail={setEmail}
          setPassword={setPassword}
          onLogin={handleLogin}
          onGuestLogin={handleGuestLogin}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
