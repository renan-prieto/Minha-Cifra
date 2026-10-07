import { ArrowBackHeader } from "@/src/components/common/arrowBackHeader";
import Photo from "@/src/components/profile/Photo";
import { getEditProfileStyles } from "@/src/components/styles/stylesEditProfile";
import { useTheme } from "@/src/context/ThemeContext";
import { useUser } from "@/src/context/UserContext";
import { useProfileActions } from "@/src/hooks/useProfileActions";
import { router } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditProfileScreen() {
  const { isDark } = useTheme();
  const { user } = useUser();
  const styles = getEditProfileStyles(isDark);
  const { handlePickImageAsync } = useProfileActions();

  const editOptions = [
    {
      label: "Nome",
      value: user?.name ?? "Editar nome",
      route: "/(management)/views/edit/editName" as const,
    },
    {
      label: "Senha",
      value: "Redefinir por e-mail",
      route: "/(management)/views/edit/editPassword" as const,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ArrowBackHeader title="Editar perfil" route="/(tabs)/perfil" />

        <View style={styles.card}>
          <View style={styles.photoSection}>
            <Photo
              isDark={isDark}
              user={user}
              onPickImage={handlePickImageAsync}
              size={100}
              fallbackText={user?.name?.[0] ?? "U"}
              showPlaceholderLabel={false}
            />

            <TouchableOpacity
              style={styles.photoAction}
              onPress={handlePickImageAsync}
            >
              <Text style={styles.photoActionText}>Alterar foto</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formSection}>
            {editOptions.map((item) => (
              <TouchableOpacity
                key={item.label}
                style={styles.optionCard}
                onPress={() => router.push(item.route)}
                activeOpacity={0.8}
              >
                <View style={styles.optionTextWrap}>
                  <Text style={styles.optionLabel}>{item.label}</Text>
                  <Text style={styles.optionValue}>{item.value}</Text>
                </View>
                <Text style={styles.optionArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
