import { act, renderHook } from "@testing-library/react-native";
import { Alert } from "react-native";

import { useFinance } from "@/src/contexts/FinanceContext";
import { useNewReleaseViewModel } from "@/src/viewmodels/useNewReleaseViewModel";

const mockRouter = { push: jest.fn() };

jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
}));

jest.mock("@/src/contexts/FinanceContext", () => ({
  useFinance: jest.fn(),
}));

const finance = {
  tagsEarn: ["Salário", "Freela"],
  tagsInvestments: ["Renda fixa"],
  tagsLost: ["Casa", "Mercado"],
  addEarn: jest.fn(),
  addInvestments: jest.fn(),
  addLost: jest.fn(),
  addTagEarn: jest.fn(),
  addTagInvestments: jest.fn(),
  addTagLost: jest.fn(),
};

function fillForm(
  result: { current: ReturnType<typeof useNewReleaseViewModel> },
  values: Partial<{
    type: "earn" | "investiments" | "lost";
    title: string;
    value: string;
    tag: string;
    rate: string;
  }>,
) {
  act(() => {
    if (values.type) result.current.handleChangeType(values.type);
    if (values.title !== undefined) result.current.setTitle(values.title);
    if (values.value !== undefined) result.current.setValue(values.value);
    if (values.tag !== undefined) result.current.setSelectedTag(values.tag);
    if (values.rate !== undefined) result.current.setRate(values.rate);
  });
}

describe("useNewReleaseViewModel", () => {
  const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => undefined);

  beforeEach(() => {
    jest.clearAllMocks();
    (useFinance as jest.Mock).mockReturnValue(finance);
  });

  afterAll(() => {
    alertSpy.mockRestore();
  });

  it("inicia no tipo despesa", () => {
    const { result } = renderHook(() => useNewReleaseViewModel());

    expect(result.current.type).toBe("lost");
    expect(result.current.cardTitle).toBe("Despesas");
    expect(result.current.currentTags).toEqual(finance.tagsLost);
  });

  it("troca o tipo e reinicia o formulário", () => {
    const { result } = renderHook(() => useNewReleaseViewModel());

    fillForm(result, { title: "Teste", value: "10", tag: "Casa" });
    act(() => result.current.handleChangeType("earn"));

    expect(result.current.type).toBe("earn");
    expect(result.current.cardTitle).toBe("Ganhos");
    expect(result.current.currentTags).toEqual(finance.tagsEarn);
    expect(result.current.title).toBe("");
    expect(result.current.value).toBe("");
    expect(result.current.selectedTag).toBe("");
  });

  it("abre e fecha o modal de tag", () => {
    const { result } = renderHook(() => useNewReleaseViewModel());

    act(() => result.current.openAddTagModal());
    expect(result.current.isModalVisible).toBe(true);

    act(() => result.current.closeAddTagModal());
    expect(result.current.isModalVisible).toBe(false);
  });

  it("exige título e valor", async () => {
    const { result } = renderHook(() => useNewReleaseViewModel());

    await act(async () => {
      await result.current.handleSave();
    });

    expect(alertSpy).toHaveBeenCalledWith(
      "Atenção",
      "Preencha o título e o valor.",
    );
    expect(finance.addLost).not.toHaveBeenCalled();
  });

  it("exige um valor numérico positivo", async () => {
    const { result } = renderHook(() => useNewReleaseViewModel());
    fillForm(result, { title: "Mercado", value: "0" });

    await act(async () => {
      await result.current.handleSave();
    });

    expect(alertSpy).toHaveBeenCalledWith("Atenção", "Informe um valor válido.");
  });

  it("exige uma tag selecionada", async () => {
    const { result } = renderHook(() => useNewReleaseViewModel());
    fillForm(result, { title: "Mercado", value: "50" });

    await act(async () => {
      await result.current.handleSave();
    });

    expect(alertSpy).toHaveBeenCalledWith(
      "Atenção",
      "Selecione ou crie uma tag.",
    );
  });

  it("salva uma despesa", async () => {
    const { result } = renderHook(() => useNewReleaseViewModel());
    fillForm(result, { title: "  Mercado  ", value: "1.234,56", tag: "Casa" });

    await act(async () => {
      await result.current.handleSave();
    });

    expect(finance.addLost).toHaveBeenCalledWith({
      title: "Mercado",
      value: 1234.56,
      tag: "Casa",
    });
    expect(result.current.title).toBe("");
    expect(result.current.value).toBe("");
    expect(result.current.selectedTag).toBe("");

    const buttons = alertSpy.mock.calls.at(-1)?.[2];
    expect(buttons?.[0].text).toBe("OK");
    buttons?.[0].onPress?.();
    expect(mockRouter.push).toHaveBeenCalledWith("/");
  });

  it("salva um ganho", async () => {
    const { result } = renderHook(() => useNewReleaseViewModel());
    fillForm(result, {
      type: "earn",
      title: "Salário",
      value: "5000",
      tag: "Salário",
    });

    await act(async () => {
      await result.current.handleSave();
    });

    expect(finance.addEarn).toHaveBeenCalledWith({
      title: "Salário",
      value: 5000,
      tag: "Salário",
    });
    expect(finance.addLost).not.toHaveBeenCalled();
  });

  it("salva um investimento com taxa", async () => {
    const { result } = renderHook(() => useNewReleaseViewModel());
    fillForm(result, {
      type: "investiments",
      title: "CDB",
      value: "1000",
      tag: "Renda fixa",
      rate: "12,5",
    });

    await act(async () => {
      await result.current.handleSave();
    });

    expect(finance.addInvestments).toHaveBeenCalledWith({
      title: "CDB",
      value: 1000,
      tag: "Renda fixa",
      rate: 12.5,
    });
  });

  it("exige a taxa em investimentos", async () => {
    const { result } = renderHook(() => useNewReleaseViewModel());
    fillForm(result, {
      type: "investiments",
      title: "CDB",
      value: "1000",
      tag: "Renda fixa",
    });

    await act(async () => {
      await result.current.handleSave();
    });

    expect(alertSpy).toHaveBeenCalledWith(
      "Atenção",
      "Informe a porcentagem de retorno para investimentos.",
    );
    expect(finance.addInvestments).not.toHaveBeenCalled();
  });

  it("rejeita taxa de investimento negativa", async () => {
    const { result } = renderHook(() => useNewReleaseViewModel());
    fillForm(result, {
      type: "investiments",
      title: "CDB",
      value: "1000",
      tag: "Renda fixa",
      rate: "-1",
    });

    await act(async () => {
      await result.current.handleSave();
    });

    expect(alertSpy).toHaveBeenCalledWith(
      "Atenção",
      "Informe uma porcentagem válida.",
    );
  });

  it("ignora tag vazia", async () => {
    const { result } = renderHook(() => useNewReleaseViewModel());

    await act(async () => {
      await result.current.handleAddTag("   ");
    });

    expect(finance.addTagLost).not.toHaveBeenCalled();
  });

  it("adiciona tag ao tipo atual", async () => {
    const { result } = renderHook(() => useNewReleaseViewModel());

    act(() => result.current.openAddTagModal());
    await act(async () => {
      await result.current.handleAddTag("  Nova  ");
    });

    expect(finance.addTagLost).toHaveBeenCalledWith("Nova");
    expect(result.current.selectedTag).toBe("Nova");
    expect(result.current.isModalVisible).toBe(false);
  });

  it("adiciona tag de ganho e de investimento", async () => {
    const { result } = renderHook(() => useNewReleaseViewModel());

    act(() => result.current.handleChangeType("earn"));
    await act(async () => {
      await result.current.handleAddTag("Bônus");
    });
    expect(finance.addTagEarn).toHaveBeenCalledWith("Bônus");

    act(() => result.current.handleChangeType("investiments"));
    await act(async () => {
      await result.current.handleAddTag("Ações");
    });
    expect(finance.addTagInvestments).toHaveBeenCalledWith("Ações");
  });
});
