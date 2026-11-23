import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useCallback } from "react";
import { Alert } from "react-native";

import { useUser } from "@/src/contexts/UserContext";

/**
 * ViewModel do perfil do usuário.
 * Centraliza a seleção de foto e a navegação para edição/configurações.
 */
export function useProfileViewModel() {
  const { user, updateProfileImage } = useUser();

  const handlePickImageAsync = useCallback(async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Permissão necessária",
        "É preciso permitir o acesso à galeria para alterar a foto de perfil.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      updateProfileImage(result.assets[0].uri);
    }
  }, [updateProfileImage]);

  const handleNavigateToConfiguration = useCallback(() => {
    router.push("/(management)/configuration");
  }, []);

  const handleEditProfile = useCallback(() => {
    router.replace("/(management)/views/editPerfil");
  }, []);

  return {
    user,
    handlePickImageAsync,
    handleNavigateToConfiguration,
    handleEditProfile,
  };
}
