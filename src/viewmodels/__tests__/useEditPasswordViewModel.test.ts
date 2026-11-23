import { act, renderHook } from "@testing-library/react-native";
import { Alert, Keyboard } from "react-native";

import { useUser } from "@/src/contexts/UserContext";
import { requestPasswordReset } from "@/src/repositories/userRepository";
import { useEditPasswordViewModel } from "@/src/viewmodels/useEditPasswordViewModel";

jest.mock("@/src/contexts/UserContext", () => ({
  useUser: jest.fn(),
}));

jest.mock("@/src/repositories/userRepository", () => ({
  requestPasswordReset: jest.fn(),
}));

describe("useEditPasswordViewModel", () => {
  const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
  const dismissSpy = jest
    .spyOn(Keyboard, "dismiss")
    .mockImplementation(() => undefined);

  beforeEach(() => {
    jest.clearAllMocks();
    (useUser as jest.Mock).mockReturnValue({
      user: { id: "1", email: "renan@example.com" },
    });
    (requestPasswordReset as jest.Mock).mockResolvedValue({ message: "ok" });
  });

  afterAll(() => {
    alertSpy.mockRestore();
    dismissSpy.mockRestore();
  });

  it("inicia com o e-mail do usuário", () => {
    const { result } = renderHook(() => useEditPasswordViewModel());

    expect(result.current.email).toBe("renan@example.com");
    expect(result.current.isSending).toBe(false);
  });

  it("exige um e-mail", async () => {
    const { result } = renderHook(() => useEditPasswordViewModel());
    act(() => result.current.setEmail("   "));

    await act(async () => {
      await result.current.handleSendLink();
    });

    expect(alertSpy).toHaveBeenCalledWith(
      "E-mail obrigatório",
      "Digite o e-mail da sua conta.",
    );
    expect(requestPasswordReset).not.toHaveBeenCalled();
  });

  it("envia o link com e-mail normalizado", async () => {
    const { result } = renderHook(() => useEditPasswordViewModel());
    act(() => result.current.setEmail("  RENAN@EXAMPLE.COM  "));

    await act(async () => {
      await result.current.handleSendLink();
    });

    expect(Keyboard.dismiss).toHaveBeenCalledTimes(1);
    expect(requestPasswordReset).toHaveBeenCalledWith("renan@example.com");
    expect(alertSpy).toHaveBeenCalledWith(
      "Verifique seu e-mail",
      "Se houver uma conta ativa para esse endereço, enviaremos um link para redefinir a senha.",
    );
    expect(result.current.isSending).toBe(false);
  });

  it("mostra o erro da API", async () => {
    (requestPasswordReset as jest.Mock).mockRejectedValue({
      response: { data: { error: "Serviço indisponível." } },
    });
    const { result } = renderHook(() => useEditPasswordViewModel());

    await act(async () => {
      await result.current.handleSendLink();
    });

    expect(alertSpy).toHaveBeenCalledWith(
      "Não foi possível enviar",
      "Serviço indisponível.",
    );
    expect(result.current.isSending).toBe(false);
  });

  it("usa mensagem padrão quando o erro não tem corpo", async () => {
    (requestPasswordReset as jest.Mock).mockRejectedValue(new Error("falha"));
    const { result } = renderHook(() => useEditPasswordViewModel());

    await act(async () => {
      await result.current.handleSendLink();
    });

    expect(alertSpy).toHaveBeenCalledWith(
      "Não foi possível enviar",
      "Tente novamente mais tarde.",
    );
  });
});
