import { api } from "../api";
import {
  createExpense,
  createIncome,
  getExpenses,
  getIncome,
} from "../walletRepository";

jest.mock("../api", () => ({
  api: { get: jest.fn(), post: jest.fn() },
}));

describe("walletRepository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("busca as receitas do usuário", async () => {
    (api.get as jest.Mock).mockResolvedValue({ data: [{ id: 1 }] });

    await expect(getIncome(7)).resolves.toEqual([{ id: 1 }]);
    expect(api.get).toHaveBeenCalledWith("/income/7");
  });

  it("busca as despesas do usuário", async () => {
    (api.get as jest.Mock).mockResolvedValue({ data: [{ id: 2 }] });

    await expect(getExpenses(7)).resolves.toEqual([{ id: 2 }]);
    expect(api.get).toHaveBeenCalledWith("/expenses/7");
  });

  it("cria uma receita", async () => {
    const payload = { title: "Salário", value: 1000 };
    (api.post as jest.Mock).mockResolvedValue({ data: { id: 3 } });

    await expect(createIncome(payload)).resolves.toEqual({ id: 3 });
    expect(api.post).toHaveBeenCalledWith("/income", payload);
  });

  it("cria uma despesa", async () => {
    const payload = { title: "Mercado", value: 100 };
    (api.post as jest.Mock).mockResolvedValue({ data: { id: 4 } });

    await expect(createExpense(payload)).resolves.toEqual({ id: 4 });
    expect(api.post).toHaveBeenCalledWith("/expenses", payload);
  });

  it("propaga erros da API", async () => {
    (api.get as jest.Mock).mockRejectedValue(new Error("falha"));

    await expect(getIncome(1)).rejects.toThrow("falha");
  });
});
