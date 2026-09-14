import type { SQLiteDatabase } from "expo-sqlite";

import type { ItemFinance } from "@/src/context/FinanceContext";

type FinanceType = "earn" | "investment" | "lost";

type DatabaseItem = {
  id: number;
  title: string;
  value: number;
  date: string;
  rate?: number | null;
  gain?: number | null;
  tag: string;
};

const typeToTagType: Record<FinanceType, "renda" | "gasto" | "investimento"> = {
  earn: "renda",
  lost: "gasto",
  investment: "investimento",
};

function getDateParts(dateValue: string) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    const now = new Date();

    return {
      year: now.getFullYear(),
      month: now.toLocaleString("pt-BR", { month: "long" }),
    };
  }

  return {
    year: date.getFullYear(),
    month: date.toLocaleString("pt-BR", { month: "long" }),
  };
}

async function getOrCreateTag(
  db: SQLiteDatabase,
  tagName: string,
  type: FinanceType,
  date: string,
) {
  const tagType = typeToTagType[type];
  const existingTag = await db.getFirstAsync<{ tag_id: number }>(
    `
      SELECT tag_id
      FROM tag
      WHERE tag_nome = ? AND tag_tipo = ?
      LIMIT 1
    `,
    tagName,
    tagType,
  );

  if (existingTag) {
    return existingTag.tag_id;
  }

  const result = await db.runAsync(
    `
      INSERT INTO tag (tag_nome, tag_tipo, tag_data)
      VALUES (?, ?, ?)
    `,
    tagName,
    tagType,
    date,
  );

  return result.lastInsertRowId;
}

export async function insertFinanceItem(
  db: SQLiteDatabase,
  type: FinanceType,
  item: Omit<ItemFinance, "id">,
) {
  const date = new Date(item.year, getMonthIndex(item.month)).toISOString();
  const tagId = await getOrCreateTag(db, item.tag, type, date);

  if (type === "earn") {
    const result = await db.runAsync(
      `
        INSERT INTO renda (renda_nome, renda_valor, renda_data, tag_id)
        VALUES (?, ?, ?, ?)
      `,
      item.title ?? "",
      item.value,
      date,
      tagId,
    );

    return { ...item, id: String(result.lastInsertRowId) };
  }

  if (type === "lost") {
    const result = await db.runAsync(
      `
        INSERT INTO gastos (gasto_nome, gasto_valor, gasto_data, tag_id)
        VALUES (?, ?, ?, ?)
      `,
      item.title ?? "",
      item.value,
      date,
      tagId,
    );

    return { ...item, id: String(result.lastInsertRowId) };
  }

  const rate = item.rate ?? 0;
  const gain = item.value * (rate / 100);
  const result = await db.runAsync(
    `
      INSERT INTO investimentos (
        investimento_nome,
        investimento_valor_gasto,
        investimento_valor_ganho,
        investimento_data,
        investimento_rate,
        tag_id
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    item.title ?? "",
    item.value,
    gain,
    date,
    rate,
    tagId,
  );

  return { ...item, id: String(result.lastInsertRowId), gain };
}

function getMonthIndex(month: string) {
  const monthNames = [
    "janeiro",
    "fevereiro",
    "março",
    "abril",
    "maio",
    "junho",
    "julho",
    "agosto",
    "setembro",
    "outubro",
    "novembro",
    "dezembro",
  ];

  const index = monthNames.indexOf(month.toLowerCase());
  return index >= 0 ? index : new Date().getMonth();
}

export async function getFinanceItems(
  db: SQLiteDatabase,
  type: FinanceType,
): Promise<ItemFinance[]> {
  const table = type === "earn" ? "renda" : type === "lost" ? "gastos" : "investimentos";
  const idColumn = type === "earn" ? "renda_id" : type === "lost" ? "gasto_id" : "investimento_id";
  const titleColumn = type === "earn" ? "renda_nome" : type === "lost" ? "gasto_nome" : "investimento_nome";
  const valueColumn = type === "earn" ? "renda_valor" : type === "lost" ? "gasto_valor" : "investimento_valor_gasto";
  const dateColumn = type === "earn" ? "renda_data" : type === "lost" ? "gasto_data" : "investimento_data";
  const rateColumn = type === "investment" ? ", i.investimento_rate AS rate, i.investimento_valor_ganho AS gain" : "";

  const rows = await db.getAllAsync<DatabaseItem>(
    `
      SELECT
        i.${idColumn} AS id,
        i.${titleColumn} AS title,
        i.${valueColumn} AS value,
        i.${dateColumn} AS date${rateColumn},
        COALESCE(t.tag_nome, '') AS tag
      FROM ${table} i
      LEFT JOIN tag t ON t.tag_id = i.tag_id
      ORDER BY i.${idColumn} DESC
    `,
  );

  return rows.map((row) => {
    const { year, month } = getDateParts(row.date);

    return {
      id: String(row.id),
      title: row.title,
      value: Number(row.value),
      tag: row.tag,
      year,
      month,
      ...(type === "investment" && row.rate != null
        ? { rate: Number(row.rate), gain: Number(row.gain ?? 0) }
        : {}),
    };
  });
}

export async function getFinanceTags(
  db: SQLiteDatabase,
  type: FinanceType,
) {
  const rows = await db.getAllAsync<{ tag_nome: string }>(
    `
      SELECT tag_nome
      FROM tag
      WHERE tag_tipo = ?
      ORDER BY tag_id ASC
    `,
    typeToTagType[type],
  );

  return rows.map((row) => row.tag_nome);
}

export async function insertFinanceTag(
  db: SQLiteDatabase,
  type: FinanceType,
  tagName: string,
) {
  await getOrCreateTag(db, tagName, type, new Date().toISOString());
}