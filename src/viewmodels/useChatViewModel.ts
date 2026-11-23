import { useCallback, useRef, useState } from "react";

import { useUser } from "@/src/contexts/UserContext";
import type { ChatUiMessage } from "@/src/models/Chat";
import { sendChatMessage } from "@/src/repositories/chatRepository";

export const CHAT_SUGGESTIONS = [
  "Como organizar meu orçamento?",
  "Como começar a guardar dinheiro?",
  "O que é uma reserva de emergência?",
];

/**
 * ViewModel do assistente financeiro.
 * Gerencia o histórico da conversa, o envio de mensagens e o cancelamento
 * lógico de respostas quando uma nova conversa é iniciada.
 */
export function useChatViewModel() {
  const { user } = useUser();
  const isGuest = Boolean(user?.isGuest);
  const nextMessageId = useRef(1);
  const conversationId = useRef(0);

  const [messages, setMessages] = useState<ChatUiMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isResponding, setIsResponding] = useState(false);

  const startNewConversation = useCallback(() => {
    conversationId.current += 1;
    setMessages([]);
    setDraft("");
    setIsResponding(false);
  }, []);

  const sendMessage = useCallback(
    async (text = draft) => {
      const trimmedText = text.trim();

      if (!trimmedText || isResponding) return;

      const userMessage: ChatUiMessage = {
        id: nextMessageId.current++,
        text: trimmedText,
        role: "user",
      };

      setMessages((currentMessages) => [...currentMessages, userMessage]);
      setDraft("");
      setIsResponding(true);
      const activeConversationId = conversationId.current;

      try {
        const reply = await sendChatMessage([...messages, userMessage], {
          guest: isGuest,
        });
        if (activeConversationId !== conversationId.current) return;

        setMessages((currentMessages) => [
          ...currentMessages,
          { id: nextMessageId.current++, text: reply, role: "assistant" },
        ]);
      } catch (error) {
        if (activeConversationId !== conversationId.current) return;

        setMessages((currentMessages) => [
          ...currentMessages,
          {
            id: nextMessageId.current++,
            text:
              error instanceof Error
                ? error.message
                : "Não foi possível obter uma resposta agora.",
            role: "assistant",
          },
        ]);
      } finally {
        if (activeConversationId === conversationId.current) {
          setIsResponding(false);
        }
      }
    },
    [draft, isGuest, isResponding, messages],
  );

  return {
    messages,
    draft,
    setDraft,
    isResponding,
    suggestions: CHAT_SUGGESTIONS,
    startNewConversation,
    sendMessage,
  };
}
