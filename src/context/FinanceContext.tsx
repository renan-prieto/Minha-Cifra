import { useSQLiteContext } from "expo-sqlite";
import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";

import {
    getFinanceItems,
    getFinanceTags,
    insertFinanceItem,
    insertFinanceTag,
} from "@/src/services/financeDatabase";

const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export interface ItemFinance {
  id: string;
  title: string | null;
  value: number;
  tag: string;

  year: number;
  month: string;
  rate?: number; // porcentagem de retorno para investimentos (ex: 5 => 5%)
  gain?: number;
}

interface NewItemFinance {
  title: string | null;
  value: number;
  tag: string;
  rate?: number;
}

interface FinanceContextData {
  itemsEarn: ItemFinance[];
  setItemsEarn: React.Dispatch<React.SetStateAction<ItemFinance[]>>;

  itemsInvestments: ItemFinance[];
  setItemsInvestments: React.Dispatch<React.SetStateAction<ItemFinance[]>>;

  itemsLost: ItemFinance[];
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

  addEarn: (item: NewItemFinance) => Promise<void>;
  addInvestments: (item: NewItemFinance) => Promise<void>;
  addLost: (item: NewItemFinance) => Promise<void>;
}

const FinanceContext = createContext<FinanceContextData>(
  {} as FinanceContextData,
);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const db = useSQLiteContext();
  const [itemsEarn, setItemsEarn] = useState<ItemFinance[]>([]);

  const [itemsInvestments, setItemsInvestments] = useState<ItemFinance[]>([]);

  const [itemsLost, setItemsLost] = useState<ItemFinance[]>([]);

  const [tagsEarn, setTagsEarn] = useState<string[]>([]);

  const [tagsInvestments, setTagsInvestments] = useState<string[]>([]);

  const [tagsLost, setTagsLost] = useState<string[]>([]);

  useEffect(() => {
    async function loadFinanceData() {
      const [earn, investments, lost, earnTags, investmentTags, lostTags] =
        await Promise.all([
          getFinanceItems(db, "earn"),
          getFinanceItems(db, "investment"),
          getFinanceItems(db, "lost"),
          getFinanceTags(db, "earn"),
          getFinanceTags(db, "investment"),
          getFinanceTags(db, "lost"),
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
  }, [db]);

  // =========================
  // DATA ATUAL
  // =========================

  const getCurrentDate = () => {
    const date = new Date();

    return {
      year: date.getFullYear(),
      month: MONTH_NAMES[date.getMonth()],
    };
  };

  // =========================
  // TAGS - RECEITAS
  // =========================

  const addTagEarn = async (tag: string) => {
    const tagFormatada = tag.trim();

    if (!tagFormatada) {
      return;
    }

    await insertFinanceTag(db, "earn", tagFormatada);

    setTagsEarn((prev) => {
      if (prev.includes(tagFormatada)) {
        return prev;
      }

      return [...prev, tagFormatada];
    });
  };

  const addTagInvestments = async (tag: string) => {
    const tagFormatada = tag.trim();

    if (!tagFormatada) {
      return;
    }

    await insertFinanceTag(db, "investment", tagFormatada);

    setTagsInvestments((prev) => {
      if (prev.includes(tagFormatada)) {
        return prev;
      }

      return [...prev, tagFormatada];
    });
  };

  const addTagLost = async (tag: string) => {
    const tagFormatada = tag.trim();

    if (!tagFormatada) {
      return;
    }

    await insertFinanceTag(db, "lost", tagFormatada);

    setTagsLost((prev) => {
      if (prev.includes(tagFormatada)) {
        return prev;
      }

      return [...prev, tagFormatada];
    });
  };

  const addEarn = async (newItem: NewItemFinance) => {
    const { year, month } = getCurrentDate();

    const itemWithId: ItemFinance = {
      ...newItem,
      id: Date.now().toString(),
      year,
      month,
    };

    const savedItem = await insertFinanceItem(db, "earn", itemWithId);
    setItemsEarn((prev) => [...prev, savedItem]);
  };

  const addInvestments = async (newItem: NewItemFinance) => {
    const { year, month } = getCurrentDate();

    const itemWithId: ItemFinance = {
      ...newItem,
      id: Date.now().toString(),
      year,
      month,
    };

    const savedItem = await insertFinanceItem(db, "investment", itemWithId);
    setItemsInvestments((prev) => [...prev, savedItem]);
  };

  const addLost = async (newItem: NewItemFinance) => {
    const { year, month } = getCurrentDate();

    const itemWithId: ItemFinance = {
      ...newItem,
      id: Date.now().toString(),
      year,
      month,
    };

    const savedItem = await insertFinanceItem(db, "lost", itemWithId);
    setItemsLost((prev) => [...prev, savedItem]);
  };

  const totalEarn = itemsEarn.reduce((acc, item) => acc + item.value, 0);

  const totalInvestments = itemsInvestments.reduce(
    (acc, item) => acc + item.value,
    0,
  );

  const totalLost = itemsLost.reduce((acc, item) => acc + item.value, 0);

  const balance = totalEarn - (totalLost + totalInvestments);

  return (
    <FinanceContext.Provider
      value={{
        itemsEarn,
        setItemsEarn,

        itemsInvestments,
        setItemsInvestments,

        itemsLost,
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

        addEarn,
        addInvestments,
        addLost,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export const useFinance = () => useContext(FinanceContext);
