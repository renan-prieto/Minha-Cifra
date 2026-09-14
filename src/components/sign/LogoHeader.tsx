import React from "react";
import { Image, Text, View } from "react-native";
import { getSignStyles } from "../styles/stylesSign";

interface Props {
  isDark: boolean;
}

export default function LogoHeader({ isDark }: Props) {
  const styles = getSignStyles(isDark);
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Minha</Text>

      <Image
        source={require("../../../assets/images/logo_no_background.png")}
        style={styles.logo}
      />

      <Text style={styles.title}>ifra</Text>
    </View>
  );
}
