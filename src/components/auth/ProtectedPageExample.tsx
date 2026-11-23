import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useUser } from "@/src/contexts/UserContext";
import { useIsAuthenticatedViewModel } from "@/src/viewmodels/useIsAuthenticatedViewModel";

/**
 * Exemplo de página protegida que verifica autenticação
 * Use este padrão em qualquer página que exija o usuário estar logado
 */
export default function ProtectedPageExample() {
  const { user, signOut } = useUser();
  const { isAuthenticated, isLoading } = useIsAuthenticatedViewModel();

  const handleLogout = async () => {
    await signOut();
    // Redirecionar para login se necessário
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Verificando autenticação...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Você não está autenticado</Text>
        <Text>Por favor, faça login para continuar</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 20 }}>
        Bem-vindo, {user?.name}!
      </Text>

      <Text>Email: {user?.email}</Text>
      <Text>ID: {user?.id}</Text>

      <TouchableOpacity
        onPress={handleLogout}
        style={{
          marginTop: 20,
          padding: 12,
          backgroundColor: "#ff0000",
          borderRadius: 8,
        }}
      >
        <Text style={{ color: "white", textAlign: "center" }}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
