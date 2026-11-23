import { View } from "react-native";

import LogoHeader from "@/src/components/sign/LogoHeader";
import RegisterForm from "@/src/components/sign/RegisterForm";
import { getSignStyles } from "@/src/components/styles/stylesSign";
import { useTheme } from "@/src/contexts/ThemeContext";
import { useSignUpViewModel } from "@/src/viewmodels/useSignUpViewModel";

export default function SignUpView() {
  const { isDark } = useTheme();
  const styles = getSignStyles(isDark);

  const {
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    acceptedTerms,
    setAcceptedTerms,
    handleRegister,
  } = useSignUpViewModel();

  return (
    <View style={styles.container}>
      <LogoHeader isDark={isDark} />

      <RegisterForm
        isDark={isDark}
        email={email}
        password={password}
        confirmPassword={confirmPassword}
        setEmail={setEmail}
        setPassword={setPassword}
        setConfirmPassword={setConfirmPassword}
        acceptedTerms={acceptedTerms}
        setAcceptedTerms={setAcceptedTerms}
        onRegister={handleRegister}
      />
    </View>
  );
}
