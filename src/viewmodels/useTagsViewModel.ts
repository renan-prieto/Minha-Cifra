import { useCallback, useState } from "react";
import { Alert } from "react-native";

import { useFinance } from "@/src/contexts/FinanceContext";
import type { FinanceCategory, FinanceType } from "@/src/models/Finance";

interface TagTarget {
  type: FinanceType;
  name: string;
}

/**
 * ViewModel do gerenciamento de tags.
 * Controla modais, edição, exclusão e a lista de categorias.
 */
export function useTagsViewModel() {
  const { tagsEarn, tagsInvestments, tagsLost, renameTag, deleteTag } =
    useFinance();

  const [selectedCategory, setSelectedCategory] = useState<FinanceCategory | null>(
    null,
  );
  const [editingTag, setEditingTag] = useState<TagTarget | null>(null);
  const [deletingTag, setDeletingTag] = useState<TagTarget | null>(null);
  const [tagName, setTagName] = useState("");

  const categories: FinanceCategory[] = [
    {
      type: "earn",
      title: "Ganhos",
      description: "Entradas e receitas",
      tags: tagsEarn,
    },
    {
      type: "lost",
      title: "Gastos",
      description: "Despesas e saídas",
      tags: tagsLost,
    },
    {
      type: "investment",
      title: "Investimentos",
      description: "Aplicações e retornos",
      tags: tagsInvestments,
    },
  ];

  const closeModal = useCallback(() => {
    setSelectedCategory(null);
    setEditingTag(null);
    setDeletingTag(null);
    setTagName("");
  }, []);

  const closeActionModal = useCallback(() => {
    setEditingTag(null);
    setDeletingTag(null);
    setTagName("");
  }, []);

  const openCategory = useCallback((category: FinanceCategory) => {
    setSelectedCategory(category);
  }, []);

  const openEdit = useCallback((type: FinanceType, name: string) => {
    setEditingTag({ type, name });
    setTagName(name);
  }, []);

  const openDelete = useCallback((type: FinanceType, name: string) => {
    setDeletingTag({ type, name });
    setTagName("");
  }, []);

  const handleRename = useCallback(async () => {
    const nextName = tagName.trim();

    if (!nextName) {
      Alert.alert("Atenção", "Informe um nome para a tag.");
      return;
    }

    if (editingTag) {
      await renameTag(editingTag.type, editingTag.name, nextName);
      setEditingTag(null);
      setTagName("");
    }
  }, [editingTag, renameTag, tagName]);

  const handleDelete = useCallback(async () => {
    if (!deletingTag || tagName.trim() !== deletingTag.name) {
      Alert.alert(
        "Nome incorreto",
        "Digite exatamente o nome da tag para confirmar.",
      );
      return;
    }

    await deleteTag(deletingTag.type, deletingTag.name);
    closeModal();
  }, [closeModal, deleteTag, deletingTag, tagName]);

  return {
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
  };
}
