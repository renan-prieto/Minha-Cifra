import { View } from "react-native";

import { EmailArea, PasswordArea } from "@/src/components/common/areas";
import { ButtonSignIn } from "@/src/components/common/buttons";
import { DivisorLabel } from "@/src/components/common/divisor";
import { LinkCadastro, LinkTermos } from "@/src/components/common/links";
import { router } from "expo-router";
import { getSignStyles } from "../styles/stylesSign";

interface Props {
  isDark: boolean;
  email: string;
  password: string;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  acceptedTerms: boolean;
  setAcceptedTerms: (accepted: boolean) => void;
  onLogin: () => void;
}

export default function LoginForm({
  isDark,
  email,
  password,
  setEmail,
  setPassword,
  acceptedTerms,
  setAcceptedTerms,
  onLogin,
}: Props) {
  const styles = getSignStyles(isDark);

  return (
    <View style={styles.card}>
      <EmailArea value={email} onChangeText={setEmail} />

      <PasswordArea value={password} onChangeText={setPassword} />

      <LinkTermos
        checked={acceptedTerms}
        onCheckedChange={setAcceptedTerms}
      />

      <ButtonSignIn onPress={onLogin} />

      <DivisorLabel />

      <LinkCadastro onPress={() => router.replace("/signUp")} />
    </View>
  );
}
