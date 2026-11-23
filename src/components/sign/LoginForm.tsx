import { View } from "react-native";

import { EmailArea, PasswordArea } from "@/src/components/common/areas";
import { ButtonSignIn } from "@/src/components/common/buttons";
import { DivisorLabel } from "@/src/components/common/divisor";
import { LinkCadastro, LinkVisitante } from "@/src/components/common/links";
import { router } from "expo-router";
import { getSignStyles } from "../styles/stylesSign";

interface Props {
  isDark: boolean;
  email: string;
  password: string;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  onLogin: () => void;
  onGuestLogin: () => void;
}

export default function LoginForm({
  isDark,
  email,
  password,
  setEmail,
  setPassword,
  onLogin,
  onGuestLogin,
}: Props) {
  const styles = getSignStyles(isDark);

  return (
    <View style={styles.card}>
      <EmailArea value={email} onChangeText={setEmail} />

      <PasswordArea value={password} onChangeText={setPassword} />

      <ButtonSignIn onPress={onLogin} />

      <DivisorLabel />

      <LinkCadastro onPress={() => router.replace("/signUp")} />

      <LinkVisitante onPress={onGuestLogin} />
    </View>
  );
}
