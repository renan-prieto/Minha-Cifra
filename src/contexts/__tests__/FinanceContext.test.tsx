import { act, renderHook, waitFor } from "@testing-library/react-native";
import { useSQLiteContext } from "expo-sqlite";

import { MONTH_NAMES } from "@/src/constants/months";
import { FinanceProvider, useFinance } from "@/src/contexts/FinanceContext";
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

jest.mock("expo-sqlite", () => ({
  useSQLiteContext: jest.fn(),
}));

jest.mock("@/src/contexts/UserContext", () => ({
  useUser: jest.fn(),
}));

jest.mock("@/src/repositories/financeRepository", () => ({
  claimLegacyFinanceData: jest.fn(),
  deleteFinanceTag: jest.fn(),
  getFinanceItems: jest.fn(),
  getFinanceTags: jest.fn(),
  insertFinanceItem: jest.fn(),
  insertFinanceTag: jest.fn(),
  updateFinanceTag: jest.fn(),
}));

const now = new Date();
const currentMonth = MONTH_NAMES[now.getMonth()];
const currentYear = now.getFullYear();
const otherMonth = MONTH_NAMES[(now.getMonth() + 1) % 12];

const earnItems = [
  {
    id: "1",
    title: "Salário",
    value: 5000,
    tag: "Trabalho",
    year: currentYear,
    month: currentMonth,
  },
  {
    id: "2",
    title: "Salário antigo",
    value: 1000,
    tag: "Trabalho",
    year: currentYear - 1,
    month: currentMonth,
  },
];

const investmentItems = [
  {
    id: "3",
    title: "CDB",
    value: 1000,
    tag: "Renda fixa",
    year: currentYear,
    month: currentMonth,
  },
];

const lostItems = [
  {
    id: "4",
    title: "Mercado",
    value: 300,
    tag: "Mercado",
    year: currentYear,
    month: currentMonth,
  },
  {
    id: "5",
    title: "Aluguel",
    value: 200,
    tag: "Casa",
    year: currentYear,
    month: otherMonth,
  },
];

const db = { name: "db" };

function renderFinance() {
  return renderHook(() => useFinance(), { wrapper: FinanceProvider });
}

async function waitForLoaded(result: { current: ReturnType<typeof useFinance> }) {
  await waitFor(() => expect(result.current.itemsEarn).toHaveLength(2));
}

describe("FinanceContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useSQLiteContext as jest.Mock).mockReturnValue(db);
    (useUser as jest.Mock).mockReturnValue({
      user: { id: "user-1", email: "renan@example.com" },
    });

    (getFinanceItems as jest.Mock).mockImplementation(
      (_db, _userId, type: string) => {
        if (type === "earn") return Promise.resolve(earnItems);
        if (type === "investment") return Promise.resolve(investmentItems);
        return Promise.resolve(lostItems);
      },
    );
    (getFinanceTags as jest.Mock).mockImplementation(
      (_db, _userId, type: string) => {
        if (type === "earn") return Promise.resolve(["Trabalho"]);
        if (type === "investment") return Promise.resolve(["Renda fixa"]);
        return Promise.resolve(["Mercado", "Casa"]);
      },
    );
    (claimLegacyFinanceData as jest.Mock).mockResolvedValue(undefined);
    (insertFinanceTag as jest.Mock).mockResolvedValue(undefined);
    (updateFinanceTag as jest.Mock).mockResolvedValue(undefined);
    (deleteFinanceTag as jest.Mock).mockResolvedValue(undefined);
  });

  it("carrega lançamentos e tags do usuário autenticado", async () => {
    const { result } = renderFinance();
    await waitForLoaded(result);

    expect(claimLegacyFinanceData).toHaveBeenCalledWith(db, "user-1");
    expect(getFinanceItems).toHaveBeenCalledWith(db, "user-1", "earn");
    expect(getFinanceItems).toHaveBeenCalledWith(db, "user-1", "investment");
    expect(getFinanceItems).toHaveBeenCalledWith(db, "user-1", "lost");
    expect(result.current.tagsEarn).toEqual(["Trabalho"]);
    expect(result.current.tagsInvestments).toEqual(["Renda fixa"]);
    expect(result.current.tagsLost).toEqual(["Mercado", "Casa"]);
  });

  it("limpa os dados quando não há usuário", async () => {
    (useUser as jest.Mock).mockReturnValue({ user: null });
    const { result } = renderFinance();

    await waitFor(() => expect(result.current.totalEarn).toBe(0));

    expect(getFinanceItems).not.toHaveBeenCalled();
    expect(claimLegacyFinanceData).not.toHaveBeenCalled();
    expect(result.current.itemsEarn).toEqual([]);
    expect(result.current.itemsLost).toEqual([]);
    expect(result.current.itemsInvestments).toEqual([]);
  });

  it("não reivindica dados legados para o visitante", async () => {
    (useUser as jest.Mock).mockReturnValue({
      user: { id: "-1", email: "visitante@x.com", isGuest: true },
    });
    const { result } = renderFinance();
    await waitForLoaded(result);

    expect(claimLegacyFinanceData).not.toHaveBeenCalled();
  });

  it("calcula os totais do período atual", async () => {
    const { result } = renderFinance();
    await waitForLoaded(result);

    expect(result.current.walletItemsEarn).toEqual([earnItems[0]]);
    expect(result.current.walletItemsInvestments).toEqual([investmentItems[0]]);
    expect(result.current.walletItemsLost).toEqual([lostItems[0]]);
    expect(result.current.totalEarn).toBe(5000);
    expect(result.current.totalInvestments).toBe(1000);
    expect(result.current.totalLost).toBe(300);
    expect(result.current.balance).toBe(3700);
  });

  it("registra falhas ao carregar os dados", async () => {
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    (getFinanceItems as jest.Mock).mockRejectedValue(new Error("falha"));
    renderFinance();

    await waitFor(() =>
      expect(consoleError).toHaveBeenCalledWith(
        "Erro ao carregar dados financeiros:",
        expect.any(Error),
      ),
    );
    consoleError.mockRestore();
  });

  describe("tags", () => {
    it("adiciona uma tag de ganho", async () => {
      const { result } = renderFinance();
      await waitForLoaded(result);

      await act(async () => {
        await result.current.addTagEarn("  Bônus  ");
      });

      expect(insertFinanceTag).toHaveBeenCalledWith(
        db,
        "user-1",
        "earn",
        "Bônus",
      );
      expect(result.current.tagsEarn).toEqual(["Trabalho", "Bônus"]);
    });

    it("não duplica tags existentes", async () => {
      const { result } = renderFinance();
      await waitForLoaded(result);

      await act(async () => {
        await result.current.addTagEarn("Trabalho");
      });

      expect(result.current.tagsEarn).toEqual(["Trabalho"]);
    });

    it("adiciona tags de investimento e despesa", async () => {
      const { result } = renderFinance();
      await waitForLoaded(result);

      await act(async () => {
        await result.current.addTagInvestments("Ações");
        await result.current.addTagLost("Lazer");
      });

      expect(insertFinanceTag).toHaveBeenCalledWith(
        db,
        "user-1",
        "investment",
        "Ações",
      );
      expect(insertFinanceTag).toHaveBeenCalledWith(
        db,
        "user-1",
        "lost",
        "Lazer",
      );
      expect(result.current.tagsInvestments).toContain("Ações");
      expect(result.current.tagsLost).toContain("Lazer");
    });

    it("ignora tags vazias ou sem usuário", async () => {
      const { result } = renderFinance();
      await waitForLoaded(result);

      await act(async () => {
        await result.current.addTagEarn("   ");
      });

      expect(insertFinanceTag).not.toHaveBeenCalled();
    });

    it("renomeia a tag e os lançamentos relacionados", async () => {
      const { result } = renderFinance();
      await waitForLoaded(result);

      await act(async () => {
        await result.current.renameTag("earn", "Trabalho", "  Salário  ");
      });

      expect(updateFinanceTag).toHaveBeenCalledWith(
        db,
        "user-1",
        "earn",
        "Trabalho",
        "Salário",
      );
      expect(result.current.tagsEarn).toEqual(["Salário"]);
      expect(result.current.itemsEarn.every((item) => item.tag === "Salário")).toBe(
        true,
      );
    });

    it("renomeia tags de investimento e despesa", async () => {
      const { result } = renderFinance();
      await waitForLoaded(result);

      await act(async () => {
        await result.current.renameTag("investment", "Renda fixa", "Renda");
        await result.current.renameTag("lost", "Mercado", "Supermercado");
      });

      expect(result.current.tagsInvestments).toEqual(["Renda"]);
      expect(result.current.tagsLost).toEqual(["Supermercado", "Casa"]);
      expect(result.current.itemsLost[0].tag).toBe("Supermercado");
    });

    it("não renomeia com nome vazio ou igual", async () => {
      const { result } = renderFinance();
      await waitForLoaded(result);

      await act(async () => {
        await result.current.renameTag("earn", "Trabalho", "   ");
        await result.current.renameTag("earn", "Trabalho", "Trabalho");
      });

      expect(updateFinanceTag).not.toHaveBeenCalled();
    });

    it("exclui a tag e limpa a categoria dos lançamentos", async () => {
      const { result } = renderFinance();
      await waitForLoaded(result);

      await act(async () => {
        await result.current.deleteTag("lost", "Mercado");
      });

      expect(deleteFinanceTag).toHaveBeenCalledWith(
        db,
        "user-1",
        "lost",
        "Mercado",
      );
      expect(result.current.tagsLost).toEqual(["Casa"]);
      expect(result.current.itemsLost[0].tag).toBe("");
    });

    it("exclui tags de ganho e investimento", async () => {
      const { result } = renderFinance();
      await waitForLoaded(result);

      await act(async () => {
        await result.current.deleteTag("earn", "Trabalho");
        await result.current.deleteTag("investment", "Renda fixa");
      });

      expect(result.current.tagsEarn).toEqual([]);
      expect(result.current.tagsInvestments).toEqual([]);
      expect(result.current.itemsEarn.every((item) => item.tag === "")).toBe(true);
      expect(result.current.itemsInvestments[0].tag).toBe("");
    });
  });

  describe("lançamentos", () => {
    function mockInsert() {
      (insertFinanceItem as jest.Mock).mockImplementation(
        (_db, _userId, _type, item) => Promise.resolve(item),
      );
    }

    it("adiciona um ganho no período atual", async () => {
      mockInsert();
      const { result } = renderFinance();
      await waitForLoaded(result);

      await act(async () => {
        await result.current.addEarn({ title: "Freela", value: 500, tag: "Extra" });
      });

      expect(insertFinanceItem).toHaveBeenCalledWith(
        db,
        "user-1",
        "earn",
        expect.objectContaining({
          title: "Freela",
          value: 500,
          tag: "Extra",
          year: currentYear,
          month: currentMonth,
        }),
      );
      expect(result.current.itemsEarn).toHaveLength(3);
      expect(result.current.totalEarn).toBe(5500);
    });

    it("adiciona um investimento", async () => {
      mockInsert();
      const { result } = renderFinance();
      await waitForLoaded(result);

      await act(async () => {
        await result.current.addInvestments({
          title: "Tesouro",
          value: 200,
          tag: "Renda fixa",
          rate: 10,
        });
      });

      expect(insertFinanceItem).toHaveBeenCalledWith(
        db,
        "user-1",
        "investment",
        expect.objectContaining({ rate: 10 }),
      );
      expect(result.current.itemsInvestments).toHaveLength(2);
    });

    it("adiciona uma despesa", async () => {
      mockInsert();
      const { result } = renderFinance();
      await waitForLoaded(result);

      await act(async () => {
        await result.current.addLost({ title: "Café", value: 20, tag: "Lazer" });
      });

      expect(insertFinanceItem).toHaveBeenCalledWith(
        db,
        "user-1",
        "lost",
        expect.objectContaining({ title: "Café" }),
      );
      expect(result.current.itemsLost).toHaveLength(3);
      expect(result.current.totalLost).toBe(320);
    });

    it("não salva lançamentos sem usuário", async () => {
      (useUser as jest.Mock).mockReturnValue({ user: null });
      const { result } = renderFinance();
      await waitFor(() => expect(result.current.totalEarn).toBe(0));

      await act(async () => {
        await result.current.addEarn({ title: "X", value: 10, tag: "Y" });
      });

      expect(insertFinanceItem).not.toHaveBeenCalled();
    });
  });
});
