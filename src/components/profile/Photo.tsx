import React, { useState } from "react";
import {
  Image,
  StyleProp,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

import { getProfileStyles } from "@/src/components/styles/stylesProfile";
import type { UserData } from "@/src/models/User";

type PhotoProps = {
  isDark: boolean;
  user: UserData | null;
  onPickImage: () => void;
  size?: number;
  containerStyle?: StyleProp<ViewStyle>;
  placeholderStyle?: StyleProp<ViewStyle>;
  placeholderTextStyle?: StyleProp<TextStyle>;
  fallbackText?: string;
  showPlaceholderLabel?: boolean;
  placeholderLabel?: string;
};

export default function Photo({
  isDark,
  user,
  onPickImage,
  size = 100,
  containerStyle,
  placeholderStyle,
  placeholderTextStyle,
  fallbackText = "U",
  showPlaceholderLabel = true,
  placeholderLabel = "Adicionar foto",
}: PhotoProps) {
  const styles = getProfileStyles(isDark);
  const [failedImageUri, setFailedImageUri] = useState<string | null>(null);

  const handleImageError = () => {
    console.warn("Erro ao carregar a imagem");
    setFailedImageUri(user?.profileImage ?? null);
  };

  const showImage = Boolean(user?.profileImage && user.profileImage !== failedImageUri);
  const imageUri = user?.profileImage;

  return (
    <TouchableOpacity onPress={onPickImage} style={containerStyle}>
      {showImage && imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
          onError={handleImageError}
        />
      ) : (
        <View style={placeholderStyle ?? styles.photo}>
          <Text style={placeholderTextStyle ?? styles.photoText}>
            {placeholderLabel}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
