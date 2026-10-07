import { ArrowBackHeader } from "@/src/components/common/arrowBackHeader";
import { getEditFieldStyles } from "@/src/components/styles/stylesEditField";
import { useTheme } from "@/src/context/ThemeContext";
import { useUser } from "@/src/context/UserContext";
import { updateUserName } from "@/src/services/userService";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditNameScreen() {
  const { isDark } = useTheme();
  const { user, updateUser } = useUser();
  const styles = getEditFieldStyles(isDark);
  const [name, setName] = useState(user?.name ?? "");

  const handleSave = async () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      alert("Digite seu nome antes de salvar.");
      return;
    }

    if (!user?.id) {
      alert("Não foi possível identificar o usuário.");
      return;
    }

    try {
      await updateUserName(user.id, trimmedName);
      await updateUser({ ...user, name: trimmedName });
      router.back();
    } catch (error: any) {
      alert(error?.response?.data?.error || "Erro ao salvar o nome.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ArrowBackHeader title="Nome" route="/(management)/views/editPerfil" />

        <View style={styles.card}>
          <View style={styles.field}>
            <Text style={styles.label}>Seu nome</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Digite seu nome"
              placeholderTextColor={isDark ? "#888" : "#999"}
            />
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Salvar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
