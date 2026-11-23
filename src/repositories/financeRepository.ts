import type { SQLiteDatabase } from "expo-sqlite";

import type { FinanceType, ItemFinance } from "@/src/models/Finance";

export type { FinanceType } from "@/src/models/Finance";

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
  userId: string,
  tagName: string,
  type: FinanceType,
  date: string,
) {
  const tagType = typeToTagType[type];
  const existingTag = await db.getFirstAsync<{ tag_id: number }>(
    `
      SELECT tag_id
      FROM tag
      WHERE tag_nome = ? AND tag_tipo = ? AND user_id = ?
      LIMIT 1
    `,
    tagName,
    tagType,
    userId,
  );

  if (existingTag) {
    return existingTag.tag_id;
  }

  const result = await db.runAsync(
    `
      INSERT INTO tag (tag_nome, tag_tipo, tag_data, user_id)
      VALUES (?, ?, ?, ?)
    `,
    tagName,
    tagType,
    date,
    userId,
  );

  return result.lastInsertRowId;
}

export async function insertFinanceItem(
  db: SQLiteDatabase,
  userId: string,
  type: FinanceType,
  item: Omit<ItemFinance, "id">,
) {
  const date = toStoredDate(item.year, getMonthIndex(item.month));
  const tagId = await getOrCreateTag(db, userId, item.tag, type, date);

  if (type === "earn") {
    const result = await db.runAsync(
      `
        INSERT INTO renda (renda_nome, renda_valor, renda_data, tag_id, user_id)
        VALUES (?, ?, ?, ?, ?)
      `,
      item.title ?? "",
      item.value,
      date,
      tagId,
      userId,
    );

    return { ...item, id: String(result.lastInsertRowId) };
  }

  if (type === "lost") {
    const result = await db.runAsync(
      `
        INSERT INTO gastos (gasto_nome, gasto_valor, gasto_data, tag_id, user_id)
        VALUES (?, ?, ?, ?, ?)
      `,
      item.title ?? "",
      item.value,
      date,
      tagId,
      userId,
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
        tag_id,
        user_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    item.title ?? "",
    item.value,
    gain,
    date,
    rate,
    tagId,
    userId,
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

/**
 * Grava a data em horário local (sem "Z"). Usar `toISOString()` aqui poderia
 * deslocar o mês em fusos positivos (ex.: UTC+2), fazendo o lançamento aparecer
 * no mês anterior.
 */
function toStoredDate(year: number, monthIndex: number) {
  const month = String(monthIndex + 1).padStart(2, "0");
  return `${year}-${month}-01T00:00:00`;
}

export async function getFinanceItems(
  db: SQLiteDatabase,
  userId: string,
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
      LEFT JOIN tag t ON t.tag_id = i.tag_id AND t.user_id = i.user_id
      WHERE i.user_id = ?
      ORDER BY i.${idColumn} DESC
    `,
    userId,
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
  userId: string,
  type: FinanceType,
) {
  const rows = await db.getAllAsync<{ tag_nome: string }>(
    `
      SELECT tag_nome
      FROM tag
      WHERE tag_tipo = ? AND user_id = ?
      ORDER BY tag_id ASC
    `,
    typeToTagType[type],
    userId,
  );

  return rows.map((row) => row.tag_nome);
}

export async function insertFinanceTag(
  db: SQLiteDatabase,
  userId: string,
  type: FinanceType,
  tagName: string,
) {
  await getOrCreateTag(db, userId, tagName, type, new Date().toISOString());
}

export async function updateFinanceTag(
  db: SQLiteDatabase,
  userId: string,
  type: FinanceType,
  currentName: string,
  nextName: string,
) {
  await db.runAsync(
    `
      UPDATE tag
      SET tag_nome = ?
      WHERE tag_nome = ? AND tag_tipo = ? AND user_id = ?
    `,
    nextName,
    currentName,
    typeToTagType[type],
    userId,
  );
}

export async function deleteFinanceTag(
  db: SQLiteDatabase,
  userId: string,
  type: FinanceType,
  tagName: string,
) {
  // A FK usa ON DELETE SET NULL: os lançamentos continuam salvos, apenas
  // ficam sem categoria. Apagar os itens junto com a tag causava perda de dados.
  await db.runAsync(
    `
      DELETE FROM tag
      WHERE tag_nome = ? AND tag_tipo = ? AND user_id = ?
    `,
    tagName,
    typeToTagType[type],
    userId,
  );
}

/**
 * Dados criados antes do isolamento por conta têm user_id = 0. O primeiro
 * usuário autenticado em um aparelho existente assume esses lançamentos.
 */
export async function claimLegacyFinanceData(
  db: SQLiteDatabase,
  userId: string,
) {
  await db.withTransactionAsync(async () => {
    await db.runAsync("UPDATE tag SET user_id = ? WHERE user_id = 0", userId);
    await db.runAsync("UPDATE renda SET user_id = ? WHERE user_id = 0", userId);
    await db.runAsync("UPDATE gastos SET user_id = ? WHERE user_id = 0", userId);
    await db.runAsync(
      "UPDATE investimentos SET user_id = ? WHERE user_id = 0",
      userId,
    );
  });
}