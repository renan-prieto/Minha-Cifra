import { act, renderHook } from "@testing-library/react-native";
import { Alert } from "react-native";

import { useFinance } from "@/src/contexts/FinanceContext";
import { useTagsViewModel } from "@/src/viewmodels/useTagsViewModel";

jest.mock("@/src/contexts/FinanceContext", () => ({
  useFinance: jest.fn(),
}));

const renameTag = jest.fn();
const deleteTag = jest.fn();

describe("useTagsViewModel", () => {
  const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => undefined);

  beforeEach(() => {
    jest.clearAllMocks();
    (useFinance as jest.Mock).mockReturnValue({
      tagsEarn: ["Salário"],
      tagsInvestments: ["CDB"],
      tagsLost: ["Casa", "Mercado"],
      renameTag,
      deleteTag,
    });
  });

  afterAll(() => {
    alertSpy.mockRestore();
  });

  it("monta as categorias a partir das tags do contexto", () => {
    const { result } = renderHook(() => useTagsViewModel());

    expect(result.current.categories).toEqual([
      {
        type: "earn",
        title: "Ganhos",
        description: "Entradas e receitas",
        tags: ["Salário"],
      },
      {
        type: "lost",
        title: "Gastos",
        description: "Despesas e saídas",
        tags: ["Casa", "Mercado"],
      },
      {
        type: "investment",
        title: "Investimentos",
        description: "Aplicações e retornos",
        tags: ["CDB"],
      },
    ]);
  });

  it("abre e fecha a categoria", () => {
    const { result } = renderHook(() => useTagsViewModel());

    act(() => result.current.openCategory(result.current.categories[0]));
    expect(result.current.selectedCategory?.type).toBe("earn");

    act(() => result.current.closeModal());
    expect(result.current.selectedCategory).toBeNull();
  });

  it("abre a edição com o nome atual", () => {
    const { result } = renderHook(() => useTagsViewModel());

    act(() => result.current.openEdit("lost", "Casa"));

    expect(result.current.editingTag).toEqual({ type: "lost", name: "Casa" });
    expect(result.current.tagName).toBe("Casa");
  });

  it("abre a exclusão limpando o nome digitado", () => {
    const { result } = renderHook(() => useTagsViewModel());

    act(() => result.current.setTagName("antigo"));
    act(() => result.current.openDelete("earn", "Salário"));

    expect(result.current.deletingTag).toEqual({ type: "earn", name: "Salário" });
    expect(result.current.tagName).toBe("");
  });

  it("exige um nome ao renomear", async () => {
    const { result } = renderHook(() => useTagsViewModel());

    act(() => result.current.openEdit("lost", "Casa"));
    act(() => result.current.setTagName("   "));

    await act(async () => {
      await result.current.handleRename();
    });

    expect(alertSpy).toHaveBeenCalledWith("Atenção", "Informe um nome para a tag.");
    expect(renameTag).not.toHaveBeenCalled();
  });

  it("renomeia a tag e fecha a edição", async () => {
    const { result } = renderHook(() => useTagsViewModel());

    act(() => result.current.openEdit("lost", "Casa"));
    act(() => result.current.setTagName("  Moradia  "));

    await act(async () => {
      await result.current.handleRename();
    });

    expect(renameTag).toHaveBeenCalledWith("lost", "Casa", "Moradia");
    expect(result.current.editingTag).toBeNull();
    expect(result.current.tagName).toBe("");
  });

  it("não renomeia quando não há edição ativa", async () => {
    const { result } = renderHook(() => useTagsViewModel());

    act(() => result.current.setTagName("Moradia"));
    await act(async () => {
      await result.current.handleRename();
    });

    expect(renameTag).not.toHaveBeenCalled();
  });

  it("exige o nome exato para excluir", async () => {
    const { result } = renderHook(() => useTagsViewModel());

    act(() => result.current.openDelete("lost", "Casa"));
    act(() => result.current.setTagName("casa"));

    await act(async () => {
      await result.current.handleDelete();
    });

    expect(alertSpy).toHaveBeenCalledWith(
      "Nome incorreto",
      "Digite exatamente o nome da tag para confirmar.",
    );
    expect(deleteTag).not.toHaveBeenCalled();
  });

  it("exclui a tag quando o nome confere", async () => {
    const { result } = renderHook(() => useTagsViewModel());

    act(() => result.current.openDelete("lost", "Casa"));
    act(() => result.current.setTagName(" Casa "));

    await act(async () => {
      await result.current.handleDelete();
    });

    expect(deleteTag).toHaveBeenCalledWith("lost", "Casa");
    expect(result.current.deletingTag).toBeNull();
    expect(result.current.selectedCategory).toBeNull();
    expect(result.current.tagName).toBe("");
  });

  it("fecha os modais de ação", () => {
    const { result } = renderHook(() => useTagsViewModel());

    act(() => result.current.openEdit("lost", "Casa"));
    act(() => result.current.closeActionModal());

    expect(result.current.editingTag).toBeNull();
    expect(result.current.deletingTag).toBeNull();
    expect(result.current.tagName).toBe("");
  });
});
