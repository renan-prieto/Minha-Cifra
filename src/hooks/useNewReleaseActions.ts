import { useRouter } from "expo-router";
import { useCallback } from "react";
import { Alert } from "react-native";

import { useFinance } from "@/src/context/FinanceContext";

export type ReleaseType = "earn" | "investiments" | "lost";

interface UseNewReleaseActionsParams {
  type: ReleaseType;
  title: string;
  value: string;
  selectedTag: string;
  rate: string;
  setType: (type: ReleaseType) => void;
  setTitle: (value: string) => void;
  setValue: (value: string) => void;
  setSelectedTag: (value: string) => void;
  setRate: (value: string) => void;
  setIsModalVisible: (value: boolean) => void;
}

export function useNewReleaseActions({
  type,
  title,
  value,
  selectedTag,
  rate,
  setType,
  setTitle,
  setValue,
  setSelectedTag,
  setRate,
  setIsModalVisible,
}: UseNewReleaseActionsParams) {
  const router = useRouter();

  const {
    addEarn,
    addInvestments,
    addLost,
    addTagEarn,
    addTagInvestments,
    addTagLost,
  } = useFinance();

  const handleSave = useCallback(async () => {
    if (!title.trim() || !value.trim()) {
      Alert.alert("Atenção", "Preencha o título e o valor.");
      return;
    }

    const numericValue = parseFloat(value.replace(",", "."));

    if (isNaN(numericValue) || numericValue <= 0) {
      Alert.alert("Atenção", "Informe um valor válido.");
      return;
    }

    if (!selectedTag) {
      Alert.alert("Atenção", "Selecione ou crie uma tag.");
      return;
    }

    let item: any = {
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

      const numericRate = parseFloat(rate.replace(",", "."));

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

    setSelectedTag("");
    setTitle("");
    setValue("");
    setRate("");

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
    router,
    selectedTag,
    setSelectedTag,
    setTitle,
    setValue,
    setRate,
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
      setSelectedTag("");
      setTitle("");
      setValue("");
      setRate("");
    },
    [setSelectedTag, setTitle, setType, setValue, setRate],
  );

  return {
    handleSave,
    handleAddTag,
    handleChangeType,
  };
}
