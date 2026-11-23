import { api } from "../api";
import { sendChatMessage } from "../chatRepository";

jest.mock("../api", () => ({
  api: { post: jest.fn() },
}));

describe("sendChatMessage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("envia a conversa para a rota autenticada", async () => {
    (api.post as jest.Mock).mockResolvedValue({ data: { reply: "Olá!" } });

    await expect(
      sendChatMessage([
        { role: "user", text: "Oi" },
        { role: "assistant", text: "Olá" },
      ]),
    ).resolves.toBe("Olá!");

    expect(api.post).toHaveBeenCalledWith("/chat", {
      messages: [
        { role: "user", content: "Oi" },
        { role: "assistant", content: "Olá" },
      ],
    });
  });

  it("usa a rota de visitante quando solicitado", async () => {
    (api.post as jest.Mock).mockResolvedValue({ data: { reply: "ok" } });

    await sendChatMessage([{ role: "user", text: "Oi" }], { guest: true });

    expect(api.post).toHaveBeenCalledWith("/chat/guest", expect.anything());
  });

  it("envia apenas as últimas 20 mensagens", async () => {
    (api.post as jest.Mock).mockResolvedValue({ data: { reply: "ok" } });
    const messages = Array.from({ length: 25 }, (_, index) => ({
      role: "user" as const,
      text: `mensagem ${index}`,
    }));

    await sendChatMessage(messages);

    const payload = (api.post as jest.Mock).mock.calls[0][1];
    expect(payload.messages).toHaveLength(20);
    expect(payload.messages[0]).toEqual({
      role: "user",
      content: "mensagem 5",
    });
    expect(payload.messages[19]).toEqual({
      role: "user",
      content: "mensagem 24",
    });
  });

  it("repassa a mensagem de erro devolvida pela API", async () => {
    (api.post as jest.Mock).mockRejectedValue({
      isAxiosError: true,
      response: { data: { error: "Serviço indisponível." } },
    });

    await expect(
      sendChatMessage([{ role: "user", text: "Oi" }]),
    ).rejects.toThrow("Serviço indisponível.");
  });

  it("usa a mensagem padrão quando a API não informa o motivo", async () => {
    (api.post as jest.Mock).mockRejectedValue({
      isAxiosError: true,
      response: { data: {} },
    });

    await expect(
      sendChatMessage([{ role: "user", text: "Oi" }]),
    ).rejects.toThrow("Não foi possível conectar ao assistente agora.");
  });

  it("usa a mensagem padrão para erros que não são do Axios", async () => {
    (api.post as jest.Mock).mockRejectedValue(new Error("falha inesperada"));

    await expect(
      sendChatMessage([{ role: "user", text: "Oi" }]),
    ).rejects.toThrow("Não foi possível conectar ao assistente agora.");
  });
});
