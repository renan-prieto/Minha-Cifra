import type { SQLiteDatabase } from "expo-sqlite";

export async function initializeDatabase(db: SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS tag (
        tag_id INTEGER PRIMARY KEY AUTOINCREMENT,
        tag_nome TEXT NOT NULL,
        tag_tipo TEXT NOT NULL CHECK (
            tag_tipo IN ('renda', 'gasto', 'investimento')
        ),
        tag_data TEXT NOT NULL,
        user_id INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS renda (
        renda_id INTEGER PRIMARY KEY AUTOINCREMENT,
        renda_nome TEXT NOT NULL,
        renda_valor INTEGER NOT NULL,
        renda_data TEXT NOT NULL,
        tag_id INTEGER,
        user_id INTEGER NOT NULL DEFAULT 0,

        FOREIGN KEY (tag_id)
            REFERENCES tag(tag_id)
            ON DELETE SET NULL
            ON UPDATE CASCADE
    );

    CREATE TABLE IF NOT EXISTS gastos (
        gasto_id INTEGER PRIMARY KEY AUTOINCREMENT,
        gasto_nome TEXT NOT NULL,
        gasto_valor INTEGER NOT NULL,
        gasto_data TEXT NOT NULL,
        tag_id INTEGER,
        user_id INTEGER NOT NULL DEFAULT 0,

        FOREIGN KEY (tag_id)
            REFERENCES tag(tag_id)
            ON DELETE SET NULL
            ON UPDATE CASCADE
    );

    CREATE TABLE IF NOT EXISTS investimentos (
        investimento_id INTEGER PRIMARY KEY AUTOINCREMENT,
        investimento_nome TEXT NOT NULL,
        investimento_valor_gasto INTEGER NOT NULL,
        investimento_valor_ganho INTEGER DEFAULT 0,
        investimento_data TEXT NOT NULL,
        investimento_rate INTEGER NOT NULL,
        tag_id INTEGER,
        user_id INTEGER NOT NULL DEFAULT 0,

        FOREIGN KEY (tag_id)
            REFERENCES tag(tag_id)
            ON DELETE SET NULL
            ON UPDATE CASCADE
    );
  `);

  // Bancos criados antes do isolamento por conta não têm user_id.
  // O primeiro usuário autenticado "reivindica" esses dados antigos.
  await addColumnIfMissing(db, "tag", "user_id", "INTEGER NOT NULL DEFAULT 0");
  await addColumnIfMissing(db, "renda", "user_id", "INTEGER NOT NULL DEFAULT 0");
  await addColumnIfMissing(db, "gastos", "user_id", "INTEGER NOT NULL DEFAULT 0");
  await addColumnIfMissing(
    db,
    "investimentos",
    "user_id",
    "INTEGER NOT NULL DEFAULT 0",
  );

  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_tag_user ON tag(user_id);
    CREATE INDEX IF NOT EXISTS idx_renda_user ON renda(user_id);
    CREATE INDEX IF NOT EXISTS idx_gastos_user ON gastos(user_id);
    CREATE INDEX IF NOT EXISTS idx_investimentos_user ON investimentos(user_id);
  `);
}

async function addColumnIfMissing(
  db: SQLiteDatabase,
  table: string,
  column: string,
  definition: string,
) {
  const columns = await db.getAllAsync<{ name: string }>(
    `PRAGMA table_info("${table}")`,
  );

  if (!columns.some((existing) => existing.name === column)) {
    await db.execAsync(
      `ALTER TABLE "${table}" ADD COLUMN ${column} ${definition}`,
    );
  }
}