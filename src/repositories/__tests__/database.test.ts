import type { SQLiteDatabase } from "expo-sqlite";

import { initializeDatabase } from "@/src/repositories/database";

function createDb() {
  return {
    execAsync: jest.fn().mockResolvedValue(undefined),
    getAllAsync: jest.fn(),
  };
}

describe("initializeDatabase", () => {
  it("cria as tabelas, habilita FKs e cria os índices", async () => {
    const db = createDb();
    db.getAllAsync.mockResolvedValue([{ name: "user_id" }]);

    await initializeDatabase(db as unknown as SQLiteDatabase);

    const executedSql = db.execAsync.mock.calls
      .map((call) => String(call[0]).replace(/\s+/g, " "))
      .join("\n");

    expect(executedSql).toContain("PRAGMA foreign_keys = ON");
    expect(executedSql).toContain("CREATE TABLE IF NOT EXISTS tag");
    expect(executedSql).toContain("CREATE TABLE IF NOT EXISTS renda");
    expect(executedSql).toContain("CREATE TABLE IF NOT EXISTS gastos");
    expect(executedSql).toContain("CREATE TABLE IF NOT EXISTS investimentos");
    expect(executedSql).toContain("CREATE INDEX IF NOT EXISTS idx_tag_user");
    expect(executedSql).toContain(
      "CREATE INDEX IF NOT EXISTS idx_investimentos_user",
    );
    expect(db.getAllAsync).toHaveBeenCalledTimes(4);
  });

  it("adiciona user_id nas tabelas antigas que não possuem a coluna", async () => {
    const db = createDb();
    db.getAllAsync.mockResolvedValue([{ name: "tag_id" }, { name: "tag_nome" }]);

    await initializeDatabase(db as unknown as SQLiteDatabase);

    const alterations = db.execAsync.mock.calls
      .map((call) => String(call[0]))
      .filter((sql) => sql.includes("ALTER TABLE"));

    expect(alterations).toEqual([
      'ALTER TABLE "tag" ADD COLUMN user_id INTEGER NOT NULL DEFAULT 0',
      'ALTER TABLE "renda" ADD COLUMN user_id INTEGER NOT NULL DEFAULT 0',
      'ALTER TABLE "gastos" ADD COLUMN user_id INTEGER NOT NULL DEFAULT 0',
      'ALTER TABLE "investimentos" ADD COLUMN user_id INTEGER NOT NULL DEFAULT 0',
    ]);
  });

  it("não altera tabelas que já possuem user_id", async () => {
    const db = createDb();
    db.getAllAsync.mockResolvedValue([{ name: "user_id" }]);

    await initializeDatabase(db as unknown as SQLiteDatabase);

    expect(
      db.execAsync.mock.calls.some((call) =>
        String(call[0]).includes("ALTER TABLE"),
      ),
    ).toBe(false);
  });

  it("consulta a estrutura de cada tabela pelo PRAGMA", async () => {
    const db = createDb();
    db.getAllAsync.mockResolvedValue([{ name: "user_id" }]);

    await initializeDatabase(db as unknown as SQLiteDatabase);

    expect(db.getAllAsync.mock.calls.map((call) => call[0])).toEqual([
      'PRAGMA table_info("tag")',
      'PRAGMA table_info("renda")',
      'PRAGMA table_info("gastos")',
      'PRAGMA table_info("investimentos")',
    ]);
  });
});
