import { router } from "expo-router";
import { useCallback } from "react";

import { useUser } from "@/src/contexts/UserContext";

/**
 * ViewModel do onboarding (rota modal).
 * Decide o redirecionamento com base na sessão e expõe as ações de navegação.
 */
export function useWelcomeViewModel() {
  const { user, isLoading, enterAsGuest } = useUser();

  const handleNavigateToSignIn = useCallback(() => {
    router.push("/(auth)/signIn");
  }, []);

  const handleNavigateToSignUp = useCallback(() => {
    router.push("/(auth)/signUp");
  }, []);

  const handleEnterAsGuest = useCallback(async () => {
    await enterAsGuest();
  }, [enterAsGuest]);

  return {
    user,
    isLoading,
    handleNavigateToSignIn,
    handleNavigateToSignUp,
    handleEnterAsGuest,
  };
}
