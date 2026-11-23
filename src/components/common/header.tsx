import React from "react";
import { Text, View } from "react-native";
import { ThemedText } from "@/src/components/expo/themed-text";
import { useTheme } from "@/src/contexts/ThemeContext";
import { getHeaderStyle } from "@/src/components/styles/stylesHeader";

type HeaderProps = {
  title: string;
  subtitle: string;
};

export const Header = ({ title, subtitle }: HeaderProps) => {
  const { isDark } = useTheme();
  const headerStyle = getHeaderStyle(isDark);

  return (
    <View style={headerStyle.header}>
      <ThemedText type="title" style={headerStyle.title}>
        {title}
      </ThemedText>
      <Text style={headerStyle.subtitle}>{subtitle}</Text>
    </View>
  );
};
