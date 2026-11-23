import { act, renderHook } from "@testing-library/react-native";

import { useUser } from "@/src/contexts/UserContext";
import { sendChatMessage } from "@/src/repositories/chatRepository";
import {
  CHAT_SUGGESTIONS,
  useChatViewModel,
} from "@/src/viewmodels/useChatViewModel";

jest.mock("@/src/contexts/UserContext", () => ({
  useUser: jest.fn(),
}));

jest.mock("@/src/repositories/chatRepository", () => ({
  sendChatMessage: jest.fn(),
}));

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("useChatViewModel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useUser as jest.Mock).mockReturnValue({ user: { id: "1", email: "x@y.com" } });
    (sendChatMessage as jest.Mock).mockResolvedValue("Resposta do assistente");
  });

  it("expõe as sugestões de perguntas", () => {
    const { result } = renderHook(() => useChatViewModel());

    expect(result.current.suggestions).toBe(CHAT_SUGGESTIONS);
    expect(result.current.messages).toEqual([]);
    expect(result.current.draft).toBe("");
    expect(result.current.isResponding).toBe(false);
  });

  it("ignora mensagens vazias", async () => {
    const { result } = renderHook(() => useChatViewModel());

    await act(async () => {
      await result.current.sendMessage("   ");
    });

    expect(sendChatMessage).not.toHaveBeenCalled();
    expect(result.current.messages).toEqual([]);
  });

  it("envia a mensagem digitada e adiciona as duas mensagens", async () => {
    const { result } = renderHook(() => useChatViewModel());
    act(() => result.current.setDraft("  Como guardar dinheiro?  "));

    await act(async () => {
      await result.current.sendMessage();
    });

    expect(sendChatMessage).toHaveBeenCalledWith(
      [{ id: 1, role: "user", text: "Como guardar dinheiro?" }],
      { guest: false },
    );
    expect(result.current.messages).toEqual([
      { id: 1, role: "user", text: "Como guardar dinheiro?" },
      { id: 2, role: "assistant", text: "Resposta do assistente" },
    ]);
    expect(result.current.draft).toBe("");
    expect(result.current.isResponding).toBe(false);
  });

  it("envia o histórico acumulado", async () => {
    const { result } = renderHook(() => useChatViewModel());

    await act(async () => {
      await result.current.sendMessage("Primeira");
    });
    await act(async () => {
      await result.current.sendMessage("Segunda");
    });

    expect((sendChatMessage as jest.Mock).mock.calls[1][0]).toEqual([
      { id: 1, role: "user", text: "Primeira" },
      { id: 2, role: "assistant", text: "Resposta do assistente" },
      { id: 3, role: "user", text: "Segunda" },
    ]);
  });

  it("usa a rota de visitante para sessões de teste", async () => {
    (useUser as jest.Mock).mockReturnValue({
      user: { id: "-1", email: "visitante@x.com", isGuest: true },
    });
    const { result } = renderHook(() => useChatViewModel());

    await act(async () => {
      await result.current.sendMessage("Oi");
    });

    expect(sendChatMessage).toHaveBeenCalledWith(expect.any(Array), {
      guest: true,
    });
  });

  it("mostra o erro como resposta do assistente", async () => {
    (sendChatMessage as jest.Mock).mockRejectedValue(new Error("Sem conexão"));
    const { result } = renderHook(() => useChatViewModel());

    await act(async () => {
      await result.current.sendMessage("Oi");
    });

    expect(result.current.messages.at(-1)).toEqual({
      id: 2,
      role: "assistant",
      text: "Sem conexão",
    });
    expect(result.current.isResponding).toBe(false);
  });

  it("usa mensagem padrão para erros desconhecidos", async () => {
    (sendChatMessage as jest.Mock).mockRejectedValue("falha");
    const { result } = renderHook(() => useChatViewModel());

    await act(async () => {
      await result.current.sendMessage("Oi");
    });

    expect(result.current.messages.at(-1)?.text).toBe(
      "Não foi possível obter uma resposta agora.",
    );
  });

  it("limpa a conversa ao iniciar uma nova", async () => {
    const { result } = renderHook(() => useChatViewModel());

    await act(async () => {
      await result.current.sendMessage("Oi");
    });
    act(() => result.current.setDraft("rascunho"));

    act(() => result.current.startNewConversation());

    expect(result.current.messages).toEqual([]);
    expect(result.current.draft).toBe("");
    expect(result.current.isResponding).toBe(false);
  });

  it("ignora a resposta de uma conversa abandonada", async () => {
    const pending = deferred<string>();
    (sendChatMessage as jest.Mock).mockReturnValue(pending.promise);
    const { result } = renderHook(() => useChatViewModel());

    act(() => {
      void result.current.sendMessage("Oi");
    });
    act(() => result.current.startNewConversation());

    await act(async () => {
      pending.resolve("Resposta atrasada");
      await pending.promise;
    });

    expect(result.current.messages).toEqual([]);
    expect(result.current.isResponding).toBe(false);
  });

  it("não envia outra mensagem enquanto aguarda resposta", async () => {
    const pending = deferred<string>();
    (sendChatMessage as jest.Mock).mockReturnValue(pending.promise);
    const { result } = renderHook(() => useChatViewModel());

    act(() => {
      void result.current.sendMessage("Primeira");
    });

    await act(async () => {
      await result.current.sendMessage("Segunda");
    });

    expect(sendChatMessage).toHaveBeenCalledTimes(1);

    await act(async () => {
      pending.resolve("ok");
      await pending.promise;
    });
  });
});
