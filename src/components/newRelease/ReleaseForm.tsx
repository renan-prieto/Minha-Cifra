import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

import { getNewReleaseStyles } from "@/src/components/styles/stylesNewRelease";
import type { ReleaseType } from "@/src/models/Finance";

type ReleaseFormProps = {
  isDark: boolean;
  type: ReleaseType;
  title: string;
  value: string;
  selectedTag: string;
  currentTags: string[];
  onChangeTitle: (value: string) => void;
  onChangeValue: (value: string) => void;
  rate: string;
  onChangeRate: (value: string) => void;
  onSelectTag: (tag: string) => void;
  onOpenAddTag: () => void;
  onSave: () => void;
};

export default function ReleaseForm({
  isDark,
  type,
  title,
  value,
  selectedTag,
  currentTags,
  onChangeTitle,
  onChangeValue,
  onSelectTag,
  onOpenAddTag,
  onSave,
  rate,
  onChangeRate,
}: ReleaseFormProps) {
  const styles = getNewReleaseStyles(isDark);

  return (
    <View style={styles.inputCard}>
      <Text style={styles.label}>Descrição / Título</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Jantar no restaurante, Projeto X"
        placeholderTextColor={isDark ? "#888" : "#999"}
        value={title}
        onChangeText={onChangeTitle}
      />

      <Text style={styles.label}>Valor (R$)</Text>
      <TextInput
        style={styles.input}
        placeholder="0,00"
        placeholderTextColor={isDark ? "#888" : "#999"}
        keyboardType="numeric"
        value={value}
        onChangeText={onChangeValue}
      />

      {type === "investiments" && (
        <>
          <Text style={styles.label}>Porcentagem de Retorno (%)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 5"
            placeholderTextColor={isDark ? "#888" : "#999"}
            keyboardType="numeric"
            value={rate}
            onChangeText={onChangeRate}
          />
        </>
      )}

      <Text style={styles.label}>Selecione uma Tag</Text>

      <View style={styles.tagsContainer}>
        {currentTags.map((tag) => {
          const isSelected = selectedTag === tag;

          return (
            <TouchableOpacity
              key={tag}
              style={[styles.tagChip, isSelected && styles.tagChipSelected]}
              onPress={() => onSelectTag(tag)}
            >
              <Text
                style={[styles.tagText, isSelected && styles.tagTextSelected]}
              >
                #{tag}
              </Text>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          style={[styles.tagChip, styles.addTagChip]}
          onPress={onOpenAddTag}
        >
          <Text style={styles.addTagText}>+ Nova Tag</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={onSave}>
        <Text style={styles.saveButtonText}>Confirmar Lançamento</Text>
      </TouchableOpacity>
    </View>
  );
}
