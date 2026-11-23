import { useSQLiteContext } from "expo-sqlite";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AppState } from "react-native";

import { MONTH_NAMES } from "@/src/constants/months";
import type {
  FinanceType,
  ItemFinance,
  NewItemFinance,
} from "@/src/models/Finance";
import { useUser } from "@/src/contexts/UserContext";
import {
  claimLegacyFinanceData,
  deleteFinanceTag,
  getFinanceItems,
  getFinanceTags,
  insertFinanceItem,
  insertFinanceTag,
  updateFinanceTag,
} from "@/src/repositories/financeRepository";

function getCurrentDate() {
  const date = new Date();

  return {
    year: date.getFullYear(),
    month: MONTH_NAMES[date.getMonth()],
  };
}

interface FinanceContextData {
  itemsEarn: ItemFinance[];
  walletItemsEarn: ItemFinance[];
  setItemsEarn: React.Dispatch<React.SetStateAction<ItemFinance[]>>;

  itemsInvestments: ItemFinance[];
  walletItemsInvestments: ItemFinance[];
  setItemsInvestments: React.Dispatch<React.SetStateAction<ItemFinance[]>>;

  itemsLost: ItemFinance[];
  walletItemsLost: ItemFinance[];
  setItemsLost: React.Dispatch<React.SetStateAction<ItemFinance[]>>;

  totalEarn: number;
  totalInvestments: number;
  totalLost: number;

  balance: number;

  tagsEarn: string[];
  tagsInvestments: string[];
  tagsLost: string[];

  addTagEarn: (tag: string) => Promise<void>;
  addTagInvestments: (tag: string) => Promise<void>;
  addTagLost: (tag: string) => Promise<void>;
  renameTag: (
    type: FinanceType,
    currentName: string,
    nextName: string,
  ) => Promise<void>;
  deleteTag: (type: FinanceType, tagName: string) => Promise<void>;

  addEarn: (item: NewItemFinance) => Promise<void>;
  addInvestments: (item: NewItemFinance) => Promise<void>;
  addLost: (item: NewItemFinance) => Promise<void>;
}

const FinanceContext = createContext<FinanceContextData>(
  {} as FinanceContextData,
);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const db = useSQLiteContext();
  const { user } = useUser();
  const userId = user?.id ?? null;
  const isGuest = Boolean(user?.isGuest);
  const [currentPeriod, setCurrentPeriod] = useState(getCurrentDate);
  const [itemsEarn, setItemsEarn] = useState<ItemFinance[]>([]);

  const [itemsInvestments, setItemsInvestments] = useState<ItemFinance[]>([]);

  const [itemsLost, setItemsLost] = useState<ItemFinance[]>([]);

  const [tagsEarn, setTagsEarn] = useState<string[]>([]);

  const [tagsInvestments, setTagsInvestments] = useState<string[]>([]);

  const [tagsLost, setTagsLost] = useState<string[]>([]);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const refreshPeriod = () => {
      const nextPeriod = getCurrentDate();
      setCurrentPeriod((period) =>
        period.year === nextPeriod.year && period.month === nextPeriod.month
          ? period
          : nextPeriod,
      );

      const now = new Date();
      const nextDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
      );
      timeout = setTimeout(refreshPeriod, nextDay.getTime() - now.getTime());
    };

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        clearTimeout(timeout);
        refreshPeriod();
      }
    });

    refreshPeriod();

    return () => {
      clearTimeout(timeout);
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    async function loadFinanceData() {
      if (!userId) {
        setItemsEarn([]);
        setItemsInvestments([]);
        setItemsLost([]);
        setTagsEarn([]);
        setTagsInvestments([]);
        setTagsLost([]);
        return;
      }

      // O visitante não deve "reivindicar" lançamentos antigos do aparelho;
      // isso continua reservado para a primeira conta real que entrar.
      if (!isGuest) {
        await claimLegacyFinanceData(db, userId);
      }

      const [earn, investments, lost, earnTags, investmentTags, lostTags] =
        await Promise.all([
          getFinanceItems(db, userId, "earn"),
          getFinanceItems(db, userId, "investment"),
          getFinanceItems(db, userId, "lost"),
          getFinanceTags(db, userId, "earn"),
          getFinanceTags(db, userId, "investment"),
          getFinanceTags(db, userId, "lost"),
        ]);

      setItemsEarn(earn);
      setItemsInvestments(investments);
      setItemsLost(lost);
      setTagsEarn(earnTags);
      setTagsInvestments(investmentTags);
      setTagsLost(lostTags);
    }

    loadFinanceData().catch((error) => {
      console.error("Erro ao carregar dados financeiros:", error);
    });
  }, [db, userId, isGuest]);

  // =========================
  // DATA ATUAL
  // =========================

  // =========================
  // TAGS - RECEITAS
  // =========================

  const addTagEarn = useCallback(async (tag: string) => {
    const tagFormatada = tag.trim();

    if (!tagFormatada || !userId) {
      return;
    }

    await insertFinanceTag(db, userId, "earn", tagFormatada);

    setTagsEarn((prev) => {
      if (prev.includes(tagFormatada)) {
        return prev;
      }

      return [...prev, tagFormatada];
    });
  }, [db, userId]);

  const addTagInvestments = useCallback(async (tag: string) => {
    const tagFormatada = tag.trim();

    if (!tagFormatada || !userId) {
      return;
    }

    await insertFinanceTag(db, userId, "investment", tagFormatada);

    setTagsInvestments((prev) => {
      if (prev.includes(tagFormatada)) {
        return prev;
      }

      return [...prev, tagFormatada];
    });
  }, [db, userId]);

  const addTagLost = useCallback(async (tag: string) => {
    const tagFormatada = tag.trim();

    if (!tagFormatada || !userId) {
      return;
    }

    await insertFinanceTag(db, userId, "lost", tagFormatada);

    setTagsLost((prev) => {
      if (prev.includes(tagFormatada)) {
        return prev;
      }

      return [...prev, tagFormatada];
    });
  }, [db, userId]);

  const addEarn = useCallback(async (newItem: NewItemFinance) => {
    if (!userId) return;

    const { year, month } = getCurrentDate();

    const itemWithId: ItemFinance = {
      ...newItem,
      id: Date.now().toString(),
      year,
      month,
    };

    const savedItem = await insertFinanceItem(db, userId, "earn", itemWithId);
    setItemsEarn((prev) => [...prev, savedItem]);
  }, [db, userId]);

  const addInvestments = useCallback(async (newItem: NewItemFinance) => {
    if (!userId) return;

    const { year, month } = getCurrentDate();

    const itemWithId: ItemFinance = {
      ...newItem,
      id: Date.now().toString(),
      year,
      month,
    };

    const savedItem = await insertFinanceItem(db, userId, "investment", itemWithId);
    setItemsInvestments((prev) => [...prev, savedItem]);
  }, [db, userId]);

  const addLost = useCallback(async (newItem: NewItemFinance) => {
    if (!userId) return;

    const { year, month } = getCurrentDate();

    const itemWithId: ItemFinance = {
      ...newItem,
      id: Date.now().toString(),
      year,
      month,
    };

    const savedItem = await insertFinanceItem(db, userId, "lost", itemWithId);
    setItemsLost((prev) => [...prev, savedItem]);
  }, [db, userId]);

  const renameTag = useCallback(async (
    type: FinanceType,
    currentName: string,
    nextName: string,
  ) => {
    const trimmedName = nextName.trim();

    if (!trimmedName || trimmedName === currentName || !userId) {
      return;
    }

    await updateFinanceTag(db, userId, type, currentName, trimmedName);
    const updateList = (tags: string[]) =>
      tags.map((tag) => (tag === currentName ? trimmedName : tag));
    const updateItems = (items: ItemFinance[]) =>
      items.map((item) =>
        item.tag === currentName ? { ...item, tag: trimmedName } : item,
      );

    if (type === "earn") {
      setTagsEarn(updateList);
      setItemsEarn(updateItems);
    }
    if (type === "investment") {
      setTagsInvestments(updateList);
      setItemsInvestments(updateItems);
    }
    if (type === "lost") {
      setTagsLost(updateList);
      setItemsLost(updateItems);
    }
  }, [db, userId]);

  const deleteTag = useCallback(async (type: FinanceType, tagName: string) => {
    if (!userId) return;

    await deleteFinanceTag(db, userId, type, tagName);

    // Os lançamentos permanecem no banco (a FK define tag_id = NULL);
    // no estado local eles passam a aparecer como "Geral".
    const removeTagFromItems = (items: ItemFinance[]) =>
      items.map((item) =>
        item.tag === tagName ? { ...item, tag: "" } : item,
      );

    if (type === "earn") {
      setTagsEarn((prev) => prev.filter((tag) => tag !== tagName));
      setItemsEarn(removeTagFromItems);
    }
    if (type === "investment") {
      setTagsInvestments((prev) => prev.filter((tag) => tag !== tagName));
      setItemsInvestments(removeTagFromItems);
    }
    if (type === "lost") {
      setTagsLost((prev) => prev.filter((tag) => tag !== tagName));
      setItemsLost(removeTagFromItems);
    }
  }, [db, userId]);

  const isCurrentPeriod = useCallback(
    (item: ItemFinance) =>
      item.year === currentPeriod.year &&
      item.month.toLocaleLowerCase() === currentPeriod.month.toLocaleLowerCase(),
    [currentPeriod],
  );

  const walletItemsEarn = useMemo(
    () => itemsEarn.filter(isCurrentPeriod),
    [itemsEarn, isCurrentPeriod],
  );

  const walletItemsLost = useMemo(
    () => itemsLost.filter(isCurrentPeriod),
    [itemsLost, isCurrentPeriod],
  );

  const walletItemsInvestments = useMemo(
    () => itemsInvestments.filter(isCurrentPeriod),
    [itemsInvestments, isCurrentPeriod],
  );

  const totalEarn = useMemo(
    () => walletItemsEarn.reduce((acc, item) => acc + item.value, 0),
    [walletItemsEarn],
  );

  const totalInvestments = useMemo(
    () => walletItemsInvestments.reduce((acc, item) => acc + item.value, 0),
    [walletItemsInvestments],
  );

  const totalLost = useMemo(
    () => walletItemsLost.reduce((acc, item) => acc + item.value, 0),
    [walletItemsLost],
  );

  const balance = totalEarn - (totalLost + totalInvestments);
  const value = useMemo(() => ({
    itemsEarn,
    walletItemsEarn,
    setItemsEarn,
    itemsInvestments,
    walletItemsInvestments,
    setItemsInvestments,
    itemsLost,
    walletItemsLost,
    setItemsLost,
    totalEarn,
    totalInvestments,
    totalLost,
    balance,
    tagsEarn,
    tagsInvestments,
    tagsLost,
    addTagEarn,
    addTagInvestments,
    addTagLost,
    renameTag,
    deleteTag,
    addEarn,
    addInvestments,
    addLost,
  }), [
    itemsEarn,
    walletItemsEarn,
    itemsInvestments,
    walletItemsInvestments,
    itemsLost,
    walletItemsLost,
    totalEarn,
    totalInvestments,
    totalLost,
    balance,
    tagsEarn,
    tagsInvestments,
    tagsLost,
    addTagEarn,
    addTagInvestments,
    addTagLost,
    renameTag,
    deleteTag,
    addEarn,
    addInvestments,
    addLost,
  ]);

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
}

export const useFinance = () => useContext(FinanceContext);
