import { act, renderHook, waitFor } from "@testing-library/react-native";

import { UserProvider, useUser } from "@/src/contexts/UserContext";
import User from "@/src/models/User";
import {
  clearAuthData,
  getUserData,
  isAuthenticated,
  saveUserData,
} from "@/src/repositories/authRepository";
import { loginUser, logoutUser } from "@/src/repositories/userRepository";

jest.mock("@/src/repositories/authRepository", () => ({
  clearAuthData: jest.fn(),
  getUserData: jest.fn(),
  isAuthenticated: jest.fn(),
  saveUserData: jest.fn(),
}));

jest.mock("@/src/repositories/userRepository", () => ({
  loginUser: jest.fn(),
  logoutUser: jest.fn(),
}));

const storedUser = { id: "1", email: "renan@example.com", name: "Renan" };

function renderUser() {
  return renderHook(() => useUser(), { wrapper: UserProvider });
}

describe("UserContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (isAuthenticated as jest.Mock).mockResolvedValue(false);
    (getUserData as jest.Mock).mockResolvedValue(null);
    (saveUserData as jest.Mock).mockResolvedValue(undefined);
    (clearAuthData as jest.Mock).mockResolvedValue(undefined);
    (logoutUser as jest.Mock).mockResolvedValue(undefined);
  });

  it("restaura a sessão autenticada", async () => {
    (isAuthenticated as jest.Mock).mockResolvedValue(true);
    (getUserData as jest.Mock).mockResolvedValue(storedUser);

    const { result } = renderUser();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.user).toEqual(storedUser);
  });

  it("não restaura usuário quando não há sessão", async () => {
    const { result } = renderUser();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.user).toBeNull();
  });

  it("não define usuário quando a sessão é válida mas faltam dados", async () => {
    (isAuthenticated as jest.Mock).mockResolvedValue(true);
    (getUserData as jest.Mock).mockResolvedValue(null);

    const { result } = renderUser();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.user).toBeNull();
  });

  it("registra falhas ao restaurar a sessão", async () => {
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    (isAuthenticated as jest.Mock).mockRejectedValue(new Error("falha"));

    const { result } = renderUser();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.user).toBeNull();
    expect(consoleError).toHaveBeenCalledWith(
      "Erro ao restaurar sessão:",
      expect.any(Error),
    );
    consoleError.mockRestore();
  });

  it("faz login e define o usuário", async () => {
    (loginUser as jest.Mock).mockResolvedValue({
      status: 200,
      data: {
        user: { id: 7, email: "renan@example.com", name: "Renan" },
      },
    });
    const { result } = renderUser();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.signIn(
        new User("renan@example.com", "segredo", null),
      );
    });

    expect(result.current.user).toEqual({
      id: "7",
      email: "renan@example.com",
      name: "Renan",
      profileImage: undefined,
    });
  });

  it("usa a parte local do e-mail quando o nome não é informado", async () => {
    (loginUser as jest.Mock).mockResolvedValue({
      status: 200,
      data: { user: { id: 7, email: "renan@example.com" } },
    });
    const { result } = renderUser();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.signIn(new User("renan@example.com", "segredo"));
    });

    expect(result.current.user?.name).toBe("renan");
  });

  it("não define usuário quando o login não é 200", async () => {
    (loginUser as jest.Mock).mockResolvedValue({ status: 401, data: {} });
    const { result } = renderUser();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.signIn(new User("renan@example.com", "segredo"));
    });

    expect(result.current.user).toBeNull();
  });

  it("propaga erro do login", async () => {
    (loginUser as jest.Mock).mockRejectedValue(new Error("falha"));
    const { result } = renderUser();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await expect(
      result.current.signIn(new User("renan@example.com", "segredo")),
    ).rejects.toThrow("falha");
  });

  it("entra como visitante e persiste a sessão local", async () => {
    const { result } = renderUser();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.enterAsGuest();
    });

    expect(clearAuthData).toHaveBeenCalledTimes(1);
    expect(saveUserData).toHaveBeenCalledWith({
      id: "-1",
      name: "Visitante",
      email: "visitante@minhacifra.app",
      isGuest: true,
    });
    expect(result.current.user?.isGuest).toBe(true);
  });

  it("encerra a sessão real, limpando dados e chamando o servidor", async () => {
    (isAuthenticated as jest.Mock).mockResolvedValue(true);
    (getUserData as jest.Mock).mockResolvedValue(storedUser);
    const { result } = renderUser();
    await waitFor(() => expect(result.current.user).toEqual(storedUser));

    await act(async () => {
      await result.current.signOut();
    });

    expect(logoutUser).toHaveBeenCalledTimes(1);
    expect(clearAuthData).toHaveBeenCalledTimes(1);
    expect(result.current.user).toBeNull();
  });

  it("não chama o logout remoto para visitante", async () => {
    const { result } = renderUser();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.enterAsGuest();
    });
    await act(async () => {
      await result.current.signOut();
    });

    expect(logoutUser).not.toHaveBeenCalled();
    expect(result.current.user).toBeNull();
  });

  it("atualiza a foto do perfil", async () => {
    (isAuthenticated as jest.Mock).mockResolvedValue(true);
    (getUserData as jest.Mock).mockResolvedValue(storedUser);
    const { result } = renderUser();
    await waitFor(() => expect(result.current.user).toEqual(storedUser));

    act(() => result.current.updateProfileImage("file:///foto.png"));

    expect(result.current.user?.profileImage).toBe("file:///foto.png");
    await waitFor(() =>
      expect(saveUserData).toHaveBeenCalledWith(
        expect.objectContaining({ profileImage: "file:///foto.png" }),
      ),
    );
  });

  it("ignora atualização de foto quando não há usuário", async () => {
    const { result } = renderUser();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.updateProfileImage("file:///foto.png"));

    expect(saveUserData).not.toHaveBeenCalled();
  });

  it("atualiza os dados do usuário e persiste", async () => {
    const { result } = renderUser();
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const updated = { ...storedUser, name: "Novo" };

    await act(async () => {
      await result.current.updateUser(updated);
    });

    expect(result.current.user).toEqual(updated);
    expect(saveUserData).toHaveBeenCalledWith(updated);
  });

  it("expõe a verificação de autenticação", async () => {
    (isAuthenticated as jest.Mock).mockResolvedValue(true);
    const { result } = renderUser();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await expect(result.current.isUserAuthenticated()).resolves.toBe(true);
  });

  it("permite definir o usuário diretamente", async () => {
    const { result } = renderUser();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setUser(storedUser));

    expect(result.current.user).toEqual(storedUser);
  });

  it("exige o provider", () => {
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    expect(() => renderHook(() => useUser())).toThrow(
      "useUser deve ser usado dentro de um UserProvider",
    );
    consoleError.mockRestore();
  });
});
