import { Feather } from "@expo/vector-icons";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ArrowBackHeader } from "@/src/components/common/arrowBackHeader";
import { getTagStyles } from "@/src/components/styles/stylesTags";
import { useTheme } from "@/src/contexts/ThemeContext";
import { useTagsViewModel } from "@/src/viewmodels/useTagsViewModel";

export default function TagsView() {
  const { isDark } = useTheme();
  const styles = getTagStyles(isDark);

  const {
    categories,
    selectedCategory,
    editingTag,
    deletingTag,
    tagName,
    setTagName,
    closeModal,
    closeActionModal,
    openCategory,
    openEdit,
    openDelete,
    handleRename,
    handleDelete,
  } = useTagsViewModel();

  return (
    <SafeAreaView style={styles.container}>
      <ArrowBackHeader title="Tags" route="/(tabs)/perfil" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.guide}>
          <Feather name="info" size={20} color="#FFFFFF" />
          <View style={styles.guideCopy}>
            <Text style={styles.guideTitle}>Como funciona</Text>
            <Text style={styles.guideText}>
              Toque em editar ao lado de uma categoria para renomear ou excluir
              suas tags.
            </Text>
          </View>
        </View>

        {categories.map((category) => (
          <View key={category.type} style={styles.categoryCard}>
            <View style={styles.categoryHeader}>
              <View style={styles.categoryCopy}>
                <Text style={styles.categoryTitle}>{category.title}</Text>
                <Text style={styles.categoryDescription}>
                  {category.description}
                </Text>
              </View>
              <Pressable
                accessibilityLabel={`Editar tags de ${category.title}`}
                onPress={() => openCategory(category)}
                style={styles.editCategoryButton}
                hitSlop={8}
              >
                <Feather name="edit-2" size={18} color="#FFFFFF" />
              </Pressable>
            </View>
            <View style={styles.tagPreview}>
              {category.tags.length ? (
                category.tags.slice(0, 4).map((tag) => (
                  <View key={tag} style={styles.tagPill}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>Nenhuma tag cadastrada</Text>
              )}
              {category.tags.length > 4 && (
                <Text style={styles.moreText}>
                  +{category.tags.length - 4}
                </Text>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal
        visible={selectedCategory !== null}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.overlay}>
          <View
            style={[
              styles.modal,
              { backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF" },
            ]}
          >
            <View style={styles.modalHeader}>
              <View>
                <Text
                  style={[
                    styles.modalTitle,
                    { color: isDark ? "#FFFFFF" : "#000000" },
                  ]}
                >
                  {selectedCategory?.title}
                </Text>
                <Text
                  style={[
                    styles.modalSubtitle,
                    { color: isDark ? "#CCCCCC" : "#555555" },
                  ]}
                >
                  Gerencie suas tags
                </Text>
              </View>
              <Pressable onPress={closeModal} hitSlop={10}>
                <Feather
                  name="x"
                  size={24}
                  color={isDark ? "#CCCCCC" : "#555555"}
                />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.modalList}>
              {selectedCategory?.tags.length ? (
                selectedCategory.tags.map((tag) => (
                  <View
                    key={tag}
                    style={[
                      styles.tagRow,
                      { borderColor: isDark ? "#555555" : "#CCCCCC" },
                    ]}
                  >
                    <View style={styles.tagRowName}>
                      <Text
                        style={[
                          styles.rowText,
                          { color: isDark ? "#FFFFFF" : "#000000" },
                        ]}
                      >
                        {tag}
                      </Text>
                    </View>
                    <View style={styles.rowActions}>
                      <Pressable
                        onPress={() => openEdit(selectedCategory.type, tag)}
                        hitSlop={8}
                      >
                        <Feather
                          name="edit-2"
                          size={18}
                          color={isDark ? "#CCCCCC" : "#555555"}
                        />
                      </Pressable>
                      <Pressable
                        onPress={() => openDelete(selectedCategory.type, tag)}
                        hitSlop={8}
                      >
                        <Feather name="trash-2" size={18} color="#D94B4B" />
                      </Pressable>
                    </View>
                  </View>
                ))
              ) : (
                <Text
                  style={[
                    styles.emptyModalText,
                    { color: isDark ? "#CCCCCC" : "#555555" },
                  ]}
                >
                  Esta categoria ainda não tem tags.
                </Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={editingTag !== null || deletingTag !== null}
        transparent
        animationType="fade"
        onRequestClose={closeActionModal}
      >
        <View style={styles.overlay}>
          <View
            style={[
              styles.modal,
              { backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF" },
            ]}
          >
            <Text
              style={[
                styles.modalTitle,
                { color: isDark ? "#FFFFFF" : "#000000" },
              ]}
            >
              {editingTag ? "Editar tag" : "Excluir tag"}
            </Text>
            <Text
              style={[
                styles.modalSubtitle,
                { color: isDark ? "#CCCCCC" : "#555555" },
              ]}
            >
              {editingTag
                ? "Escolha um novo nome para esta tag."
                : `Digite ${deletingTag?.name} para confirmar a exclusão.`}
            </Text>
            <TextInput
              autoFocus
              value={tagName}
              onChangeText={setTagName}
              placeholder={editingTag?.name ?? deletingTag?.name}
              placeholderTextColor={isDark ? "#999999" : "#888888"}
              style={[
                styles.input,
                {
                  color: isDark ? "#FFFFFF" : "#000000",
                  borderColor: isDark ? "#555555" : "#CCCCCC",
                },
              ]}
            />
            {deletingTag && (
              <Text
                style={[
                  styles.modalSubtitle,
                  { color: isDark ? "#CCCCCC" : "#555555" },
                ]}
              >
                Os lançamentos continuam salvos e ficarão sem categoria.
              </Text>
            )}
            <View style={styles.modalButtons}>
              <Pressable style={styles.button} onPress={closeActionModal}>
                <Text style={styles.buttonText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.button,
                  styles.primaryButton,
                  { backgroundColor: editingTag ? "#006BFF" : "#D32F2F" },
                ]}
                onPress={editingTag ? handleRename : handleDelete}
              >
                <Text style={styles.primaryButtonText}>
                  {editingTag ? "Salvar" : "Excluir"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
