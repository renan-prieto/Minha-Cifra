import LogoHeader from "@/src/components/sign/LogoHeader";
import RegisterForm from "@/src/components/sign/RegisterForm";
import { getSignStyles } from "@/src/components/styles/stylesSign";
import { useTheme } from "@/src/context/ThemeContext";
import { api } from "@/src/services/api";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, View } from "react-native";

export default function SignUp() {
  const { isDark } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const styles = getSignStyles(isDark);

  const router = useRouter();

  async function handleRegister() {
    if (!email || !password || !confirmPassword) {
      Alert.alert("Erro", "Preencha todos os campos!");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Erro", "Senhas não coincidem!");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Erro", "Senha muito curta! Mínimo de 6 caracteres.");
      return;
    }

    try {
      const response = await api.post("/register", {
        email,
        password,
      });

      if (response.status === 201) {
        Alert.alert("Sucesso", "Usuário cadastrado!");

        router.replace("/signIn");
      }
    } catch (error: any) {
      const msg =
        error.response?.data?.error ?? "Erro ao conectar com o servidor";

      Alert.alert("Erro no Cadastro", msg);
    }
  }

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
        onRegister={handleRegister}
      />
    </View>
  );
}
