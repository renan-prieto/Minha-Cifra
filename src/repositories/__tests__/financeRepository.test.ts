import type { SQLiteDatabase } from "expo-sqlite";

import {
  claimLegacyFinanceData,
  deleteFinanceTag,
  getFinanceItems,
  getFinanceTags,
  insertFinanceItem,
  insertFinanceTag,
  updateFinanceTag,
} from "@/src/repositories/financeRepository";

type MockDb = {
  getFirstAsync: jest.Mock;
  getAllAsync: jest.Mock;
  runAsync: jest.Mock;
  withTransactionAsync: jest.Mock;
};

function createDb(): MockDb {
  return {
    getFirstAsync: jest.fn(),
    getAllAsync: jest.fn(),
    runAsync: jest.fn(),
    withTransactionAsync: jest.fn(async (callback: () => Promise<void>) => {
      await callback();
    }),
  };
}

function asDatabase(db: MockDb) {
  return db as unknown as SQLiteDatabase;
}

function sqlOf(call: unknown[]) {
  return String(call[0]).replace(/\s+/g, " ").trim();
}

describe("financeRepository", () => {
  describe("insertFinanceItem", () => {
    it("insere ganho reutilizando uma tag existente", async () => {
      const db = createDb();
      db.getFirstAsync.mockResolvedValue({ tag_id: 9 });
      db.runAsync.mockResolvedValue({ lastInsertRowId: 15 });

      const result = await insertFinanceItem(asDatabase(db), "user-1", "earn", {
        title: "Salário",
        value: 5000,
        tag: "Trabalho",
        year: 2024,
        month: "Março",
      });

      expect(result).toEqual({
        id: "15",
        title: "Salário",
        value: 5000,
        tag: "Trabalho",
        year: 2024,
        month: "Março",
      });

      expect(db.getFirstAsync).toHaveBeenCalledWith(
        expect.stringContaining("FROM tag"),
        "Trabalho",
        "renda",
        "user-1",
      );

      const insertCall = db.runAsync.mock.calls[0];
      expect(sqlOf(insertCall)).toContain("INSERT INTO renda");
      expect(insertCall.slice(1)).toEqual([
        "Salário",
        5000,
        "2024-03-01T00:00:00",
        9,
        "user-1",
      ]);
    });

    it("cria a tag quando ela ainda não existe", async () => {
      const db = createDb();
      db.getFirstAsync.mockResolvedValue(undefined);
      db.runAsync
        .mockResolvedValueOnce({ lastInsertRowId: 3 })
        .mockResolvedValueOnce({ lastInsertRowId: 10 });

      const result = await insertFinanceItem(asDatabase(db), "user-1", "lost", {
        title: "Mercado",
        value: 120.5,
        tag: "Alimentação",
        year: 2025,
        month: "Janeiro",
      });

      expect(result.id).toBe("10");
      expect(db.runAsync).toHaveBeenCalledTimes(2);

      const tagCall = db.runAsync.mock.calls[0];
      expect(sqlOf(tagCall)).toContain("INSERT INTO tag");
      expect(tagCall.slice(1)).toEqual([
        "Alimentação",
        "gasto",
        "2025-01-01T00:00:00",
        "user-1",
      ]);

      const expenseCall = db.runAsync.mock.calls[1];
      expect(sqlOf(expenseCall)).toContain("INSERT INTO gastos");
      expect(expenseCall.slice(1)).toEqual([
        "Mercado",
        120.5,
        "2025-01-01T00:00:00",
        3,
        "user-1",
      ]);
    });

    it("calcula o ganho de investimentos", async () => {
      const db = createDb();
      db.getFirstAsync.mockResolvedValue({ tag_id: 2 });
      db.runAsync.mockResolvedValue({ lastInsertRowId: 8 });

      const result = await insertFinanceItem(
        asDatabase(db),
        "user-1",
        "investment",
        {
          title: "CDB",
          value: 1000,
          tag: "Renda fixa",
          rate: 12.5,
          year: 2024,
          month: "Dezembro",
        },
      );

      expect(result.gain).toBe(125);
      expect(result.id).toBe("8");

      const investmentCall = db.runAsync.mock.calls[0];
      expect(sqlOf(investmentCall)).toContain("INSERT INTO investimentos");
      expect(investmentCall.slice(1)).toEqual([
        "CDB",
        1000,
        125,
        "2024-12-01T00:00:00",
        12.5,
        2,
        "user-1",
      ]);
    });

    it("usa taxa zero quando ela não é informada", async () => {
      const db = createDb();
      db.getFirstAsync.mockResolvedValue({ tag_id: 2 });
      db.runAsync.mockResolvedValue({ lastInsertRowId: 8 });

      const result = await insertFinanceItem(
        asDatabase(db),
        "user-1",
        "investment",
        {
          title: "Tesouro",
          value: 200,
          tag: "Renda fixa",
          year: 2024,
          month: "Maio",
        },
      );

      expect(result.gain).toBe(0);
      expect(db.runAsync.mock.calls[0][3]).toBe(0);
    });

    it("usa o mês atual quando o nome do mês é desconhecido", async () => {
      const db = createDb();
      db.getFirstAsync.mockResolvedValue({ tag_id: 1 });
      db.runAsync.mockResolvedValue({ lastInsertRowId: 1 });

      await insertFinanceItem(asDatabase(db), "user-1", "earn", {
        title: "Extra",
        value: 10,
        tag: "Outros",
        year: 2024,
        month: "Mês inexistente",
      });

      const now = new Date();
      const expectedMonth = String(now.getMonth() + 1).padStart(2, "0");
      expect(db.runAsync.mock.calls[0][3]).toBe(`2024-${expectedMonth}-01T00:00:00`);
    });

    it("aceita título nulo", async () => {
      const db = createDb();
      db.getFirstAsync.mockResolvedValue({ tag_id: 1 });
      db.runAsync.mockResolvedValue({ lastInsertRowId: 1 });

      await insertFinanceItem(asDatabase(db), "user-1", "earn", {
        title: null,
        value: 10,
        tag: "Outros",
        year: 2024,
        month: "Junho",
      });

      expect(db.runAsync.mock.calls[0][1]).toBe("");
    });
  });

  describe("getFinanceItems", () => {
    it("mapeia ganhos e converte a data em ano/mês", async () => {
      const db = createDb();
      db.getAllAsync.mockResolvedValue([
        {
          id: 1,
          title: "Salário",
          value: "4000",
          date: "2024-03-10T00:00:00",
          tag: "Trabalho",
        },
      ]);

      const items = await getFinanceItems(asDatabase(db), "user-1", "earn");

      expect(items).toEqual([
        {
          id: "1",
          title: "Salário",
          value: 4000,
          tag: "Trabalho",
          year: 2024,
          month: "março",
        },
      ]);

      const sql = sqlOf(db.getAllAsync.mock.calls[0]);
      expect(sql).toContain("FROM renda");
      expect(sql).toContain("WHERE i.user_id = ?");
      expect(db.getAllAsync.mock.calls[0][1]).toBe("user-1");
    });

    it("inclui taxa e ganho apenas para investimentos", async () => {
      const db = createDb();
      db.getAllAsync.mockResolvedValue([
        {
          id: 2,
          title: "CDB",
          value: 1000,
          date: "2024-07-01T00:00:00",
          rate: 10,
          gain: 100,
          tag: "Renda fixa",
        },
      ]);

      const items = await getFinanceItems(
        asDatabase(db),
        "user-1",
        "investment",
      );

      expect(items[0]).toMatchObject({
        id: "2",
        value: 1000,
        rate: 10,
        gain: 100,
        year: 2024,
        month: "julho",
      });
      expect(sqlOf(db.getAllAsync.mock.calls[0])).toContain(
        "FROM investimentos",
      );
    });

    it("mapeia gastos sem campos de investimento", async () => {
      const db = createDb();
      db.getAllAsync.mockResolvedValue([
        {
          id: 3,
          title: "Mercado",
          value: 200,
          date: "2024-01-05T00:00:00",
          tag: "",
        },
      ]);

      const items = await getFinanceItems(asDatabase(db), "user-1", "lost");

      expect(items[0]).not.toHaveProperty("rate");
      expect(items[0]).not.toHaveProperty("gain");
      expect(items[0].tag).toBe("");
      expect(sqlOf(db.getAllAsync.mock.calls[0])).toContain("FROM gastos");
    });

    it("usa a data atual quando a data persistida é inválida", async () => {
      const db = createDb();
      db.getAllAsync.mockResolvedValue([
        {
          id: 4,
          title: "Sem data",
          value: 10,
          date: "data-invalida",
          tag: "",
        },
      ]);

      const [item] = await getFinanceItems(asDatabase(db), "user-1", "lost");
      const now = new Date();

      expect(item.year).toBe(now.getFullYear());
      expect(item.month).toBe(
        now.toLocaleString("pt-BR", { month: "long" }),
      );
    });

    it("retorna lista vazia quando não há lançamentos", async () => {
      const db = createDb();
      db.getAllAsync.mockResolvedValue([]);

      await expect(
        getFinanceItems(asDatabase(db), "user-1", "earn"),
      ).resolves.toEqual([]);
    });
  });

  describe("tags", () => {
    it("lista as tags do usuário e do tipo informado", async () => {
      const db = createDb();
      db.getAllAsync.mockResolvedValue([
        { tag_nome: "Casa" },
        { tag_nome: "Mercado" },
      ]);

      const tags = await getFinanceTags(asDatabase(db), "user-1", "lost");

      expect(tags).toEqual(["Casa", "Mercado"]);
      expect(db.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining("FROM tag"),
        "gasto",
        "user-1",
      );
    });

    it("insere uma tag nova", async () => {
      const db = createDb();
      db.getFirstAsync.mockResolvedValue(undefined);
      db.runAsync.mockResolvedValue({ lastInsertRowId: 1 });

      await insertFinanceTag(asDatabase(db), "user-1", "investment", "Ações");

      expect(db.runAsync).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO tag"),
        "Ações",
        "investimento",
        expect.any(String),
        "user-1",
      );
    });

    it("renomeia uma tag existente", async () => {
      const db = createDb();
      db.runAsync.mockResolvedValue(1);

      await updateFinanceTag(
        asDatabase(db),
        "user-1",
        "earn",
        "Salário",
        "Pagamento",
      );

      expect(db.runAsync).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE tag"),
        "Pagamento",
        "Salário",
        "renda",
        "user-1",
      );
    });

    it("exclui uma tag existente", async () => {
      const db = createDb();
      db.runAsync.mockResolvedValue(1);

      await deleteFinanceTag(asDatabase(db), "user-1", "lost", "Lazer");

      expect(db.runAsync).toHaveBeenCalledWith(
        expect.stringContaining("DELETE FROM tag"),
        "Lazer",
        "gasto",
        "user-1",
      );
    });
  });

  describe("claimLegacyFinanceData", () => {
    it("reivindica os dados antigos dentro de uma transação", async () => {
      const db = createDb();
      db.runAsync.mockResolvedValue(1);

      await claimLegacyFinanceData(asDatabase(db), "user-9");

      expect(db.withTransactionAsync).toHaveBeenCalledTimes(1);
      expect(db.runAsync).toHaveBeenCalledTimes(4);
      expect(db.runAsync.mock.calls.map((call) => sqlOf(call))).toEqual([
        "UPDATE tag SET user_id = ? WHERE user_id = 0",
        "UPDATE renda SET user_id = ? WHERE user_id = 0",
        "UPDATE gastos SET user_id = ? WHERE user_id = 0",
        "UPDATE investimentos SET user_id = ? WHERE user_id = 0",
      ]);
      expect(db.runAsync.mock.calls.map((call) => call[1])).toEqual([
        "user-9",
        "user-9",
        "user-9",
        "user-9",
      ]);
    });
  });
});
