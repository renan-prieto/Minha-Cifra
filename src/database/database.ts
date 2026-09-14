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
        tag_data TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS renda (
        renda_id INTEGER PRIMARY KEY AUTOINCREMENT,
        renda_nome TEXT NOT NULL,
        renda_valor INTEGER NOT NULL,
        renda_data TEXT NOT NULL,
        tag_id INTEGER,

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

        FOREIGN KEY (tag_id)
            REFERENCES tag(tag_id)
            ON DELETE SET NULL
            ON UPDATE CASCADE
    );
  `);
}