import { isAxiosError } from "axios";

import type { ChatMessage } from "@/src/models/Chat";

import { api } from "./api";

export type { ChatMessage } from "@/src/models/Chat";

export async function sendChatMessage(
	messages: ChatMessage[],
	options?: { guest?: boolean },
): Promise<string> {
	try {
		const endpoint = options?.guest ? "/chat/guest" : "/chat";
		const response = await api.post<{ reply: string }>(endpoint, {
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