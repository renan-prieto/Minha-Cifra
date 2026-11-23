import { Redirect, Slot } from "expo-router";

import { useUser } from "@/src/contexts/UserContext";

export default function IaLayout() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return null;
  }

  if (!user) {
    return <Redirect href="/(auth)/signIn" />;
  }

  return <Slot />;
}