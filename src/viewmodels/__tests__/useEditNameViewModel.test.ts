import { act, renderHook } from "@testing-library/react-native";
import { router } from "expo-router";
import { Alert } from "react-native";

import { useUser } from "@/src/contexts/UserContext";
import { updateUserName } from "@/src/repositories/userRepository";
import { useEditNameViewModel } from "@/src/viewmodels/useEditNameViewModel";

jest.mock("expo-router", () => ({
  router: { back: jest.fn() },
}));

jest.mock("@/src/contexts/UserContext", () => ({
  useUser: jest.fn(),
}));

jest.mock("@/src/repositories/userRepository", () => ({
  updateUserName: jest.fn(),
}));

const mockUser = { id: "1", email: "renan@example.com", name: "Renan" };

describe("useEditNameViewModel", () => {
  const updateUser = jest.fn();
  const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => undefined);

  beforeEach(() => {
    jest.clearAllMocks();
    updateUser.mockResolvedValue(undefined);
    (useUser as jest.Mock).mockReturnValue({ user: mockUser, updateUser });
    (updateUserName as jest.Mock).mockResolvedValue({ status: 200 });
  });

  afterAll(() => {
    alertSpy.mockRestore();
  });

  it("inicia com o nome atual", () => {
    const { result } = renderHook(() => useEditNameViewModel());

    expect(result.current.name).toBe("Renan");
    expect(result.current.password).toBe("");
    expect(result.current.isGuest).toBe(false);
  });

  it("exige um nome não vazio", async () => {
    const { result } = renderHook(() => useEditNameViewModel());
    act(() => result.current.setName("   "));

    await act(async () => {
      await result.current.handleSave();
    });

    expect(alertSpy).toHaveBeenCalledWith(
      "Nome obrigatório",
      "Digite seu nome antes de salvar.",
    );
  });

  it("avisa quando o usuário não tem id", async () => {
    (useUser as jest.Mock).mockReturnValue({
      user: { email: "renan@example.com" },
      updateUser,
    });
    const { result } = renderHook(() => useEditNameViewModel());
    act(() => result.current.setName("Novo nome"));

    await act(async () => {
      await result.current.handleSave();
    });

    expect(alertSpy).toHaveBeenCalledWith(
      "Erro",
      "Não foi possível identificar o usuário.",
    );
  });

  it("salva o nome do visitante apenas no aparelho", async () => {
    (useUser as jest.Mock).mockReturnValue({
      user: { ...mockUser, isGuest: true },
      updateUser,
    });
    const { result } = renderHook(() => useEditNameViewModel());
    act(() => result.current.setName("  Visitante novo  "));

    await act(async () => {
      await result.current.handleSave();
    });

    expect(updateUserName).not.toHaveBeenCalled();
    expect(updateUser).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Visitante novo", isGuest: true }),
    );
    expect(router.back).toHaveBeenCalledTimes(1);
  });

  it("exige a senha para usuários reais", async () => {
    const { result } = renderHook(() => useEditNameViewModel());
    act(() => result.current.setName("Novo nome"));

    await act(async () => {
      await result.current.handleSave();
    });

    expect(alertSpy).toHaveBeenCalledWith(
      "Senha obrigatória",
      "Digite sua senha atual para confirmar a alteração.",
    );
    expect(updateUserName).not.toHaveBeenCalled();
  });

  it("atualiza o nome no servidor e no contexto", async () => {
    const { result } = renderHook(() => useEditNameViewModel());
    act(() => {
      result.current.setName("  Novo nome  ");
      result.current.setPassword("senha");
    });

    await act(async () => {
      await result.current.handleSave();
    });

    expect(updateUserName).toHaveBeenCalledWith("1", "Novo nome", "senha");
    expect(updateUser).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Novo nome" }),
    );
    expect(router.back).toHaveBeenCalledTimes(1);
  });

  it("mostra o erro devolvido pela API", async () => {
    (updateUserName as jest.Mock).mockRejectedValue({
      response: { data: { error: "Senha incorreta." } },
    });
    const { result } = renderHook(() => useEditNameViewModel());
    act(() => {
      result.current.setName("Novo nome");
      result.current.setPassword("senha");
    });

    await act(async () => {
      await result.current.handleSave();
    });

    expect(alertSpy).toHaveBeenCalledWith("Erro ao salvar", "Senha incorreta.");
    expect(updateUser).not.toHaveBeenCalled();
    expect(router.back).not.toHaveBeenCalled();
  });

  it("usa mensagem padrão quando o erro não tem corpo", async () => {
    (updateUserName as jest.Mock).mockRejectedValue(new Error("falha"));
    const { result } = renderHook(() => useEditNameViewModel());
    act(() => {
      result.current.setName("Novo nome");
      result.current.setPassword("senha");
    });

    await act(async () => {
      await result.current.handleSave();
    });

    expect(alertSpy).toHaveBeenCalledWith("Erro ao salvar", "Erro ao salvar o nome.");
  });
});
