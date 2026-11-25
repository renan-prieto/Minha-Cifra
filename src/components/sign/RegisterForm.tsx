import { useRouter } from "expo-router";
import { View, useWindowDimensions } from "react-native";

import {
  ConfirmPasswordArea,
  EmailArea,
  PasswordArea,
} from "@/src/components/common/areas";

import { ButtonSignUp } from "@/src/components/common/buttons";
import { DivisorLabel } from "@/src/components/common/divisor";
import { LinkPossui, LinkTermos } from "@/src/components/common/links";

import { CARD_HEIGHT_RATIO, getSignStyles } from "../styles/stylesSign";

interface Props {
  isDark: boolean;
  email: string;
  password: string;
  confirmPassword: string;

  setEmail: (text: string) => void;
  setPassword: (text: string) => void;
  setConfirmPassword: (text: string) => void;
  acceptedTerms: boolean;
  setAcceptedTerms: (accepted: boolean) => void;

  onRegister: () => void;
}

export default function RegisterForm({
  isDark,
  email,
  password,
  confirmPassword,
  setEmail,
  setPassword,
  setConfirmPassword,
  acceptedTerms,
  setAcceptedTerms,
  onRegister,
}: Props) {
  const styles = getSignStyles(isDark);
  const { height } = useWindowDimensions();
  const router = useRouter();

  return (
    <View style={[styles.card, { minHeight: height * CARD_HEIGHT_RATIO }]}>
      <EmailArea value={email} onChangeText={setEmail} />

      <PasswordArea value={password} onChangeText={setPassword} />

      <ConfirmPasswordArea
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <LinkTermos
        checked={acceptedTerms}
        onCheckedChange={setAcceptedTerms}
      />
      <ButtonSignUp onPress={onRegister} />

      

      <DivisorLabel />

      <LinkPossui onPress={() => router.replace("/signIn")} />
    </View>
  );
}