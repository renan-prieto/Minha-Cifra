export type ChatRole = "assistant" | "user";

/** Mensagem no formato aceito pela API de chat. */
export interface ChatMessage {
  role: ChatRole;
  text: string;
}

/** Mensagem renderizada na tela, com identificador local. */
export interface ChatUiMessage extends ChatMessage {
  id: number;
}
