import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

import Photo from "@/src/components/profile/Photo";
import { getProfileStyles } from "@/src/components/styles/stylesProfile";
import type { UserData } from "@/src/models/User";

type ProfileCardProps = {
  isDark: boolean;
  user: UserData | null;
  onPickImage: () => void;
  onEditProfile: () => void;
};

export default function ProfileCard({
  isDark,
  user,
  onPickImage,
  onEditProfile,
}: ProfileCardProps) {
  const styles = getProfileStyles(isDark);

  return (
    <View style={styles.profileCard}>
      <Photo
        isDark={isDark}
        user={user}
        onPickImage={onPickImage}
        size={100}
        showPlaceholderLabel={true}
        placeholderLabel="Adicionar foto"
      />

      <Text style={styles.name}>{user?.name ?? "Usuário"}</Text>
      <Text style={styles.email}>{user?.email}</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity onPress={onEditProfile} style={styles.button}>
          <Text style={styles.buttonText}>Editar perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onPickImage} style={styles.button}>
          <Text style={styles.buttonText}>Alterar foto</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
