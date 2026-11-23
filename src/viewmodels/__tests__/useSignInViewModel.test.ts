import { act, renderHook } from "@testing-library/react-native";
import { router } from "expo-router";
import { Alert } from "react-native";

import { useUser } from "@/src/contexts/UserContext";
import User from "@/src/models/User";
import { api } from "@/src/repositories/api";
import { useSignInViewModel } from "@/src/viewmodels/useSignInViewModel";

jest.mock("expo-router", () => ({
  router: { replace: jest.fn() },
}));

jest.mock("@/src/contexts/UserContext", () => ({
  useUser: jest.fn(),
}));

jest.mock("@/src/repositories/api", () => ({
  api: { post: jest.fn() },
}));

describe("useSignInViewModel", () => {
  const signIn = jest.fn();
  const enterAsGuest = jest.fn();
  const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => undefined);

  beforeEach(() => {
    jest.clearAllMocks();
    (useUser as jest.Mock).mockReturnValue({ signIn, enterAsGuest });
    signIn.mockResolvedValue(undefined);
    enterAsGuest.mockResolvedValue(undefined);
    (api.post as jest.Mock).mockResolvedValue({});
  });

  afterAll(() => {
    alertSpy.mockRestore();
  });

  it("preenche os campos", () => {
    const { result } = renderHook(() => useSignInViewModel());

    act(() => result.current.setEmail("renan@example.com"));
    act(() => result.current.setPassword("segredo"));

    expect(result.current.email).toBe("renan@example.com");
    expect(result.current.password).toBe("segredo");
  });

  it("exige todos os campos", async () => {
    const { result } = renderHook(() => useSignInViewModel());

    await act(async () => {
      await result.current.handleLogin();
    });

    expect(alertSpy).toHaveBeenCalledWith("Erro", "Preencha todos os campos.");
    expect(signIn).not.toHaveBeenCalled();
  });

  it("faz login e redireciona para as abas", async () => {
    const { result } = renderHook(() => useSignInViewModel());
    act(() => {
      result.current.setEmail("renan@example.com");
      result.current.setPassword("segredo");
    });

    await act(async () => {
      await result.current.handleLogin();
    });

    expect(signIn).toHaveBeenCalledWith(expect.any(User));
    expect(signIn.mock.calls[0][0].getEmail()).toBe("renan@example.com");
    expect(alertSpy).toHaveBeenCalledWith("Sucesso", "Seja bem vindo!");
    expect(router.replace).toHaveBeenCalledWith("/(tabs)");
  });

  it("oferece reenvio quando o e-mail não foi confirmado", async () => {
    signIn.mockRejectedValue({
      response: {
        data: {
          code: "EMAIL_NOT_VERIFIED",
          error: "Confirme seu e-mail antes de entrar.",
        },
      },
    });
    const { result } = renderHook(() => useSignInViewModel());
    act(() => {
      result.current.setEmail("renan@example.com");
      result.current.setPassword("segredo");
    });

    await act(async () => {
      await result.current.handleLogin();
    });

    expect(alertSpy).toHaveBeenCalledWith(
      "Confirme seu e-mail",
      "Confirme seu e-mail antes de entrar.",
      expect.any(Array),
    );

    const buttons = alertSpy.mock.calls.at(-1)?.[2];
    expect(buttons?.[1].text).toBe("Reenviar link");

    await act(async () => {
      await buttons?.[1].onPress?.();
    });

    expect(api.post).toHaveBeenCalledWith("/resend-verification", {
      email: "renan@example.com",
    });
    expect(alertSpy).toHaveBeenCalledWith(
      "Solicitação recebida",
      "Se houver uma conta pendente para este endereço, enviaremos um novo link.",
    );
  });

  it("avisa quando o reenvio falha", async () => {
    signIn.mockRejectedValue({
      response: { data: { code: "EMAIL_NOT_VERIFIED", error: "Confirme." } },
    });
    (api.post as jest.Mock).mockRejectedValue(new Error("falha"));
    const { result } = renderHook(() => useSignInViewModel());
    act(() => {
      result.current.setEmail("renan@example.com");
      result.current.setPassword("segredo");
    });

    await act(async () => {
      await result.current.handleLogin();
    });

    const buttons = alertSpy.mock.calls.at(-1)?.[2];
    await act(async () => {
      await buttons?.[1].onPress?.();
    });

    expect(alertSpy).toHaveBeenCalledWith(
      "Erro",
      "Não foi possível solicitar outro link agora.",
    );
  });

  it("mostra a mensagem de erro enviada pela API", async () => {
    signIn.mockRejectedValue({
      response: { data: { error: "E-mail ou senha incorretos." } },
    });
    const { result } = renderHook(() => useSignInViewModel());
    act(() => {
      result.current.setEmail("renan@example.com");
      result.current.setPassword("segredo");
    });

    await act(async () => {
      await result.current.handleLogin();
    });

    expect(alertSpy).toHaveBeenCalledWith(
      "Erro na Autenticação",
      "E-mail ou senha incorretos.",
    );
  });

  it("usa mensagem padrão quando o erro não tem corpo", async () => {
    signIn.mockRejectedValue(new Error("falha"));
    const { result } = renderHook(() => useSignInViewModel());
    act(() => {
      result.current.setEmail("renan@example.com");
      result.current.setPassword("segredo");
    });

    await act(async () => {
      await result.current.handleLogin();
    });

    expect(alertSpy).toHaveBeenCalledWith(
      "Erro na Autenticação",
      "Erro ao conectar com o servidor.",
    );
  });

  it("entra como visitante", async () => {
    const { result } = renderHook(() => useSignInViewModel());

    await act(async () => {
      await result.current.handleGuestLogin();
    });

    expect(enterAsGuest).toHaveBeenCalledTimes(1);
    expect(router.replace).toHaveBeenCalledWith("/(tabs)");
  });

  it("avisa quando a sessão de visitante falha", async () => {
    enterAsGuest.mockRejectedValue(new Error("falha"));
    const { result } = renderHook(() => useSignInViewModel());

    await act(async () => {
      await result.current.handleGuestLogin();
    });

    expect(alertSpy).toHaveBeenCalledWith(
      "Erro",
      "Não foi possível iniciar a sessão de teste. Tente novamente.",
    );
  });
});
