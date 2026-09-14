import type { Href } from "expo-router";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ArrowBackHeader } from "@/src/components/common/arrowBackHeader";
import { getStaticStyle } from "@/src/components/styles/stylesStatic";
import { useTheme } from "@/src/context/ThemeContext";

type StaticContentScreenProps = {
  title: string;
  route: Href;
  content: string;
};

export default function StaticContentScreen({
  title,
  route,
  content,
}: StaticContentScreenProps) {
  const { isDark } = useTheme();
  const styles = getStaticStyle(isDark);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ArrowBackHeader title={title} route={route} />

        <View style={styles.card}>
          <Text style={styles.textContent}>{content}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
