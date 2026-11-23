import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ArrowBackHeader } from "@/src/components/common/arrowBackHeader";
import { getEditFieldStyles } from "@/src/components/styles/stylesEditField";
import { useTheme } from "@/src/contexts/ThemeContext";
import { useEditNameViewModel } from "@/src/viewmodels/useEditNameViewModel";

export default function EditNameView() {
  const { isDark } = useTheme();
  const styles = getEditFieldStyles(isDark);

  const { name, setName, password, setPassword, isGuest, handleSave } =
    useEditNameViewModel();

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
            {isGuest ? (
              <Text style={styles.hint}>
                No modo visitante o nome é salvo apenas neste aparelho.
              </Text>
            ) : (
              <>
                <Text style={styles.label}>Senha atual</Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Digite sua senha atual"
                  placeholderTextColor={isDark ? "#888" : "#999"}
                  secureTextEntry
                  autoComplete="current-password"
                />
              </>
            )}
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Salvar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
