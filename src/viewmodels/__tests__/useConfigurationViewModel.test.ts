import { act, renderHook } from "@testing-library/react-native";
import { router } from "expo-router";
import { Alert } from "react-native";

import { useUser } from "@/src/contexts/UserContext";
import { deleteUser } from "@/src/repositories/userRepository";
import { useConfigurationViewModel } from "@/src/viewmodels/useConfigurationViewModel";

jest.mock("expo-router", () => ({
  router: { replace: jest.fn() },
}));

jest.mock("@/src/contexts/UserContext", () => ({
  useUser: jest.fn(),
}));

jest.mock("@/src/repositories/userRepository", () => ({
  deleteUser: jest.fn(),
}));

const mockUser = { id: "1", email: "renan@example.com", name: "Renan" };

describe("useConfigurationViewModel", () => {
  const signOut = jest.fn();
  const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => undefined);

  beforeEach(() => {
    jest.clearAllMocks();
    signOut.mockResolvedValue(undefined);
    (useUser as jest.Mock).mockReturnValue({ user: mockUser, signOut });
    (deleteUser as jest.Mock).mockResolvedValue({ message: "ok" });
  });

  afterAll(() => {
    alertSpy.mockRestore();
  });

  it("abre e fecha o modal de exclusão", () => {
    const { result } = renderHook(() => useConfigurationViewModel());

    act(() => result.current.openDeleteModal());
    expect(result.current.deleteModalVisible).toBe(true);

    act(() => result.current.closeDeleteModal());
    expect(result.current.deleteModalVisible).toBe(false);
  });

  it("avisa quando não há usuário", async () => {
    (useUser as jest.Mock).mockReturnValue({ user: null, signOut });
    const { result } = renderHook(() => useConfigurationViewModel());

    await act(async () => {
      await result.current.handleConfirmDeleteAccount("senha");
    });

    expect(alertSpy).toHaveBeenCalledWith("Erro", "Usuário não encontrado.");
    expect(deleteUser).not.toHaveBeenCalled();
  });

  it("encerra a sessão de visitante sem chamar a API", async () => {
    (useUser as jest.Mock).mockReturnValue({
      user: { ...mockUser, isGuest: true },
      signOut,
    });
    const { result } = renderHook(() => useConfigurationViewModel());

    await act(async () => {
      await result.current.handleConfirmDeleteAccount("senha");
    });

    expect(deleteUser).not.toHaveBeenCalled();
    expect(signOut).toHaveBeenCalledTimes(1);
    expect(result.current.deleteModalVisible).toBe(false);
    expect(alertSpy).toHaveBeenCalledWith(
      "Sessão de teste encerrada",
      expect.any(String),
      expect.any(Array),
    );

    alertSpy.mock.calls.at(-1)?.[2]?.[0].onPress?.();
    expect(router.replace).toHaveBeenCalledWith("/(auth)/signIn");
  });

  it("exclui a conta e encerra a sessão", async () => {
    const { result } = renderHook(() => useConfigurationViewModel());

    await act(async () => {
      await result.current.handleConfirmDeleteAccount("senha");
    });

    expect(deleteUser).toHaveBeenCalledWith("1", "senha");
    expect(signOut).toHaveBeenCalledTimes(1);
    expect(result.current.deleteModalVisible).toBe(false);
    expect(result.current.deletingAccount).toBe(false);
    expect(alertSpy).toHaveBeenCalledWith(
      "Conta excluída",
      "Sua conta foi excluída com sucesso.",
      expect.any(Array),
    );

    alertSpy.mock.calls.at(-1)?.[2]?.[0].onPress?.();
    expect(router.replace).toHaveBeenCalledWith("/(auth)/signIn");
  });

  it("mostra o erro devolvido pela API ao excluir", async () => {
    (deleteUser as jest.Mock).mockRejectedValue({
      response: { data: { error: "Senha incorreta." } },
    });
    const { result } = renderHook(() => useConfigurationViewModel());

    await act(async () => {
      await result.current.handleConfirmDeleteAccount("senha");
    });

    expect(alertSpy).toHaveBeenCalledWith("Erro", "Senha incorreta.");
    expect(signOut).not.toHaveBeenCalled();
    expect(result.current.deletingAccount).toBe(false);
  });

  it("usa mensagem padrão quando a exclusão falha sem corpo", async () => {
    (deleteUser as jest.Mock).mockRejectedValue(new Error("falha"));
    const { result } = renderHook(() => useConfigurationViewModel());

    await act(async () => {
      await result.current.handleConfirmDeleteAccount("senha");
    });

    expect(alertSpy).toHaveBeenCalledWith(
      "Erro",
      "Não foi possível excluir sua conta.",
    );
  });

  it("confirma o logout", () => {
    const { result } = renderHook(() => useConfigurationViewModel());

    act(() => result.current.handleLogout());

    expect(alertSpy).toHaveBeenCalledWith(
      "Sair",
      "Deseja sair da conta?",
      expect.any(Array),
    );

    const buttons = alertSpy.mock.calls.at(-1)?.[2];
    expect(buttons?.[0].text).toBe("Sair");
    expect(buttons?.[1].style).toBe("cancel");

    buttons?.[0].onPress?.();
    expect(signOut).toHaveBeenCalledTimes(1);
    expect(router.replace).toHaveBeenCalledWith("/(auth)/signIn");
  });
});
