import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";

import { useFinance } from "@/src/contexts/FinanceContext";
import type { NewItemFinance, ReleaseType } from "@/src/models/Finance";
import { parseLocalizedNumber } from "@/src/utils/parseLocalizedNumber";

const RELEASE_TYPE_LABELS: Record<ReleaseType, string> = {
  earn: "Ganhos",
  investiments: "Investimentos",
  lost: "Despesas",
};

/**
 * ViewModel do formulário de novo lançamento.
 * É dono de todo o estado do formulário, das validações e das chamadas
 * ao FinanceContext.
 */
export function useNewReleaseViewModel() {
  const router = useRouter();

  const {
    tagsEarn,
    tagsInvestments,
    tagsLost,
    addEarn,
    addInvestments,
    addLost,
    addTagEarn,
    addTagInvestments,
    addTagLost,
  } = useFinance();

  const [type, setType] = useState<ReleaseType>("lost");
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [rate, setRate] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);

  const currentTags = useMemo(() => {
    if (type === "earn") return tagsEarn;
    if (type === "investiments") return tagsInvestments;
    return tagsLost;
  }, [tagsEarn, tagsInvestments, tagsLost, type]);

  const cardTitle = RELEASE_TYPE_LABELS[type];

  const resetForm = useCallback(() => {
    setSelectedTag("");
    setTitle("");
    setValue("");
    setRate("");
  }, []);

  const handleSave = useCallback(async () => {
    if (!title.trim() || !value.trim()) {
      Alert.alert("Atenção", "Preencha o título e o valor.");
      return;
    }

    const numericValue = parseLocalizedNumber(value);

    if (isNaN(numericValue) || numericValue <= 0) {
      Alert.alert("Atenção", "Informe um valor válido.");
      return;
    }

    if (!selectedTag) {
      Alert.alert("Atenção", "Selecione ou crie uma tag.");
      return;
    }

    const item: NewItemFinance = {
      title: title.trim(),
      value: numericValue,
      tag: selectedTag,
    };

    if (type === "investiments") {
      if (!rate.trim()) {
        Alert.alert(
          "Atenção",
          "Informe a porcentagem de retorno para investimentos.",
        );
        return;
      }

      const numericRate = parseLocalizedNumber(rate);

      if (isNaN(numericRate) || numericRate < 0) {
        Alert.alert("Atenção", "Informe uma porcentagem válida.");
        return;
      }

      item.rate = numericRate;
      await addInvestments(item);
    } else if (type === "earn") {
      await addEarn(item);
    } else {
      await addLost(item);
    }

    resetForm();

    Alert.alert("Sucesso", "Lançamento adicionado com sucesso!", [
      {
        text: "OK",
        onPress: () => router.push("/"),
      },
    ]);
  }, [
    addEarn,
    addInvestments,
    addLost,
    rate,
    resetForm,
    router,
    selectedTag,
    title,
    type,
    value,
  ]);

  const handleAddTag = useCallback(
    async (tag: string) => {
      const newTag = tag.trim();

      if (!newTag) return;

      if (type === "earn") {
        await addTagEarn(newTag);
      } else if (type === "investiments") {
        await addTagInvestments(newTag);
      } else {
        await addTagLost(newTag);
      }

      setSelectedTag(newTag);
      setIsModalVisible(false);
    },
    [
      addTagEarn,
      addTagInvestments,
      addTagLost,
      setIsModalVisible,
      setSelectedTag,
      type,
    ],
  );

  const handleChangeType = useCallback(
    (newType: ReleaseType) => {
      setType(newType);
      resetForm();
    },
    [resetForm],
  );

  return {
    type,
    title,
    value,
    selectedTag,
    rate,
    isModalVisible,
    currentTags,
    cardTitle,
    setTitle,
    setValue,
    setSelectedTag,
    setRate,
    openAddTagModal: useCallback(() => setIsModalVisible(true), []),
    closeAddTagModal: useCallback(() => setIsModalVisible(false), []),
    handleSave,
    handleAddTag,
    handleChangeType,
  };
}

export type { ReleaseType } from "@/src/models/Finance";
