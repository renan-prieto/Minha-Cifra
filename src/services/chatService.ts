import { isAxiosError } from "axios";

import { api } from "./api";

export type ChatMessage = {
	role: "assistant" | "user";
	text: string;
};

export async function sendChatMessage(messages: ChatMessage[]): Promise<string> {
	try {
		const response = await api.post<{ reply: string }>("/chat", {
			messages: messages
				.slice(-20)
				.map(({ role, text }) => ({ role, content: text })),
		});

		return response.data.reply;
	} catch (error) {
		if (isAxiosError<{ error?: string }>(error)) {
			throw new Error(
				error.response?.data?.error || "Não foi possível conectar ao assistente agora.",
			);
		}

		throw new Error("Não foi possível conectar ao assistente agora.");
	}
}