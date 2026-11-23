import { View } from "react-native";

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
    <View style={styles.container}>
      <LogoHeader isDark={isDark} />
      <LoginForm
        isDark={isDark}
        email={email}
        password={password}
        setEmail={setEmail}
        setPassword={setPassword}
        onLogin={handleLogin}
        onGuestLogin={handleGuestLogin}
      />
    </View>
  );
}
