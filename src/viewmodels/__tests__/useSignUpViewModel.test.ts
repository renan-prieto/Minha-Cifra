import { act, renderHook } from "@testing-library/react-native";
import { Alert } from "react-native";

import { api } from "@/src/repositories/api";
import { useSignUpViewModel } from "@/src/viewmodels/useSignUpViewModel";

const mockRouterReplace = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ replace: mockRouterReplace }),
}));

jest.mock("@/src/repositories/api", () => ({
  api: { post: jest.fn() },
}));

function fillValidForm(result: { current: ReturnType<typeof useSignUpViewModel> }) {
  act(() => {
    result.current.setEmail("renan@example.com");
    result.current.setPassword("segredo123");
    result.current.setConfirmPassword("segredo123");
    result.current.setAcceptedTerms(true);
  });
}

describe("useSignUpViewModel", () => {
  const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => undefined);

  beforeEach(() => {
    jest.clearAllMocks();
    (api.post as jest.Mock).mockResolvedValue({
      status: 202,
      data: { message: "Enviamos um link." },
    });
  });

  afterAll(() => {
    alertSpy.mockRestore();
  });

  it("preenche os campos", () => {
    const { result } = renderHook(() => useSignUpViewModel());
    fillValidForm(result);

    expect(result.current.email).toBe("renan@example.com");
    expect(result.current.password).toBe("segredo123");
    expect(result.current.confirmPassword).toBe("segredo123");
    expect(result.current.acceptedTerms).toBe(true);
  });

  it("exige o aceite dos termos", async () => {
    const { result } = renderHook(() => useSignUpViewModel());

    await act(async () => {
      await result.current.handleRegister();
    });

    expect(alertSpy).toHaveBeenCalledWith(
      "Atenção",
      "Aceite os termos de uso e a política de privacidade para continuar.",
    );
    expect(api.post).not.toHaveBeenCalled();
  });

  it("exige todos os campos", async () => {
    const { result } = renderHook(() => useSignUpViewModel());
    act(() => result.current.setAcceptedTerms(true));

    await act(async () => {
      await result.current.handleRegister();
    });

    expect(alertSpy).toHaveBeenCalledWith("Erro", "Preencha todos os campos!");
  });

  it("recusa senhas diferentes", async () => {
    const { result } = renderHook(() => useSignUpViewModel());
    fillValidForm(result);
    act(() => result.current.setConfirmPassword("outra"));

    await act(async () => {
      await result.current.handleRegister();
    });

    expect(alertSpy).toHaveBeenCalledWith("Erro", "Senhas não coincidem!");
    expect(api.post).not.toHaveBeenCalled();
  });

  it("recusa senha com menos de 8 caracteres", async () => {
    const { result } = renderHook(() => useSignUpViewModel());
    fillValidForm(result);
    act(() => {
      result.current.setPassword("1234567");
      result.current.setConfirmPassword("1234567");
    });

    await act(async () => {
      await result.current.handleRegister();
    });

    expect(alertSpy).toHaveBeenCalledWith(
      "Erro",
      "Senha muito curta! Mínimo de 8 caracteres.",
    );
  });

  it("cria a conta e redireciona para o login", async () => {
    const { result } = renderHook(() => useSignUpViewModel());
    fillValidForm(result);

    await act(async () => {
      await result.current.handleRegister();
    });

    expect(api.post).toHaveBeenCalledWith("/register", {
      email: "renan@example.com",
      password: "segredo123",
    });
    expect(alertSpy).toHaveBeenCalledWith("Verifique seu e-mail", "Enviamos um link.");
    expect(mockRouterReplace).toHaveBeenCalledWith("/signIn");
  });

  it("usa mensagem padrão quando a API não envia texto de sucesso", async () => {
    (api.post as jest.Mock).mockResolvedValue({ status: 202, data: {} });
    const { result } = renderHook(() => useSignUpViewModel());
    fillValidForm(result);

    await act(async () => {
      await result.current.handleRegister();
    });

    expect(alertSpy).toHaveBeenCalledWith(
      "Verifique seu e-mail",
      "Enviamos um link para confirmar seu endereço de e-mail.",
    );
  });

  it("não redireciona quando o status não é 202", async () => {
    (api.post as jest.Mock).mockResolvedValue({ status: 200, data: {} });
    const { result } = renderHook(() => useSignUpViewModel());
    fillValidForm(result);

    await act(async () => {
      await result.current.handleRegister();
    });

    expect(mockRouterReplace).not.toHaveBeenCalled();
  });

  it("oferece reenvio quando o e-mail inicial falha", async () => {
    (api.post as jest.Mock).mockRejectedValue({
      response: {
        data: {
          code: "EMAIL_SEND_FAILED",
          error: "Conta criada, mas o e-mail falhou.",
        },
      },
    });
    const { result } = renderHook(() => useSignUpViewModel());
    fillValidForm(result);

    await act(async () => {
      await result.current.handleRegister();
    });

    expect(alertSpy).toHaveBeenCalledWith(
      "Cadastro criado",
      "Conta criada, mas o e-mail falhou.",
      expect.any(Array),
    );

    const buttons = alertSpy.mock.calls.at(-1)?.[2];
    await act(async () => {
      await buttons?.[1].onPress?.();
    });

    expect(api.post).toHaveBeenCalledWith("/resend-verification", {
      email: "renan@example.com",
    });
  });

  it("mostra a mensagem de erro da API no cadastro", async () => {
    (api.post as jest.Mock).mockRejectedValue({
      response: { data: { error: "E-mail já cadastrado." } },
    });
    const { result } = renderHook(() => useSignUpViewModel());
    fillValidForm(result);

    await act(async () => {
      await result.current.handleRegister();
    });

    expect(alertSpy).toHaveBeenCalledWith(
      "Erro no Cadastro",
      "E-mail já cadastrado.",
    );
  });

  it("usa mensagem padrão quando o erro não tem corpo", async () => {
    (api.post as jest.Mock).mockRejectedValue(new Error("falha"));
    const { result } = renderHook(() => useSignUpViewModel());
    fillValidForm(result);

    await act(async () => {
      await result.current.handleRegister();
    });

    expect(alertSpy).toHaveBeenCalledWith(
      "Erro no Cadastro",
      "Erro ao conectar com o servidor",
    );
  });

  it("confirma o reenvio após falha inicial do e-mail", async () => {
    (api.post as jest.Mock)
      .mockRejectedValueOnce({
        response: {
          data: { code: "EMAIL_SEND_FAILED", error: "Falha ao enviar." },
        },
      })
      .mockResolvedValueOnce({
        status: 202,
        data: { message: "Novo link enviado." },
      });
    const { result } = renderHook(() => useSignUpViewModel());
    fillValidForm(result);

    await act(async () => {
      await result.current.handleRegister();
    });

    const buttons = alertSpy.mock.calls.at(-1)?.[2];
    await act(async () => {
      await buttons?.[1].onPress?.();
    });

    expect(alertSpy).toHaveBeenCalledWith(
      "Verifique seu e-mail",
      "Novo link enviado.",
    );
  });

  it("avisa quando o reenvio da confirmação falha", async () => {
    (api.post as jest.Mock)
      .mockRejectedValueOnce({
        response: {
          data: { code: "EMAIL_SEND_FAILED", error: "Falha ao enviar." },
        },
      })
      .mockRejectedValueOnce({
        response: { data: { error: "Tente mais tarde." } },
      });
    const { result } = renderHook(() => useSignUpViewModel());
    fillValidForm(result);

    await act(async () => {
      await result.current.handleRegister();
    });

    const buttons = alertSpy.mock.calls.at(-1)?.[2];
    await act(async () => {
      await buttons?.[1].onPress?.();
    });

    expect(alertSpy).toHaveBeenCalledWith("Falha no envio", "Tente mais tarde.");
  });
});
