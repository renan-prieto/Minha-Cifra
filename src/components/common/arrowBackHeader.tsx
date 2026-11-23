import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "@/src/contexts/ThemeContext";
import { getArrowHeaderStyle } from "@/src/components/styles/stylesHeader";
import { Feather } from "@expo/vector-icons";
import { router, Href } from "expo-router";

type HeaderProps = {
  title: string;
  //subtitle: string;
  route: Href;
};

export const ArrowBackHeader = ({ title, route }: HeaderProps) => {
  const { isDark } = useTheme();
  const headerStyle = getArrowHeaderStyle(isDark);

  return (
    <View style={headerStyle.header}>
      <TouchableOpacity onPress={() => router.push(route)}>
        <Feather name="arrow-left" size={24} color="white" />
      </TouchableOpacity>

      <Text style={headerStyle.title}>{title}</Text>
    </View>
  );
};
