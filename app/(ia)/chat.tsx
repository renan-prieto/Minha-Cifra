import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "@/src/context/ThemeContext";

type Message = {
	id: number;
	text: string;
	role: "assistant" | "user";
};

const suggestions = [
	"Como organizar meu orçamento?",
	"Como começar a guardar dinheiro?",
	"O que é uma reserva de emergência?",
];

function getDemoReply(message: string) {
	const normalizedMessage = message.toLocaleLowerCase("pt-BR");

	if (normalizedMessage.includes("reserva")) {
		return "Uma reserva de emergência é um valor separado para imprevistos, como uma despesa médica ou um conserto. Um bom começo é guardar aos poucos até chegar a alguns meses das suas despesas essenciais. Mantenha esse dinheiro acessível e evite contar com ele para gastos planejados.";
	}

	if (
		normalizedMessage.includes("guardar") ||
		normalizedMessage.includes("economizar") ||
		normalizedMessage.includes("poupar")
	) {
		return "Comece escolhendo um valor que caiba no seu mês, mesmo que seja pequeno. Anote seus gastos por algumas semanas, defina uma meta específica e transfira o valor para a meta assim que receber. A consistência costuma ser mais útil do que começar com um valor alto.";
	}

	if (
		normalizedMessage.includes("orçamento") ||
		normalizedMessage.includes("orcamento") ||
		normalizedMessage.includes("gastos")
	) {
		return "Uma forma simples de começar é separar seus gastos em essenciais, variáveis e objetivos. Registre o que entra e sai, confira os totais no fim da semana e escolha um ajuste realista para o próximo mês. No MinhaCifra, você pode acompanhar suas carteiras e seu saldo pela tela inicial.";
	}

	return "Posso ajudar com ideias gerais para organizar orçamento, acompanhar gastos e criar hábitos de economia. Para uma orientação útil, conte um pouco mais sobre sua dúvida. Esta resposta é demonstrativa e não substitui orientação financeira profissional.";
}

export default function ChatScreen() {
	const router = useRouter();
	const { isDark } = useTheme();
	const styles = createStyles(isDark);
	const scrollViewRef = useRef<ScrollView>(null);
	const nextMessageId = useRef(1);
	const [messages, setMessages] = useState<Message[]>([]);
	const [draft, setDraft] = useState("");
	const [isResponding, setIsResponding] = useState(false);

	useEffect(() => {
		scrollViewRef.current?.scrollToEnd({ animated: true });
	}, [messages, isResponding]);

	function startNewConversation() {
		setMessages([]);
		setDraft("");
		setIsResponding(false);
	}

	function sendMessage(text = draft) {
		const trimmedText = text.trim();

		if (!trimmedText || isResponding) return;

		const userMessage: Message = {
			id: nextMessageId.current++,
			text: trimmedText,
			role: "user",
		};

		setMessages((currentMessages) => [...currentMessages, userMessage]);
		setDraft("");
		setIsResponding(true);

		setTimeout(() => {
			const assistantMessage: Message = {
				id: nextMessageId.current++,
				text: getDemoReply(trimmedText),
				role: "assistant",
			};

			setMessages((currentMessages) => [...currentMessages, assistantMessage]);
			setIsResponding(false);
		}, 650);
	}

	return (
		<SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
			<KeyboardAvoidingView
				style={styles.keyboardView}
				behavior={Platform.OS === "ios" ? "padding" : undefined}
				keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
			>
				<View style={styles.header}>
					<TouchableOpacity
						accessibilityLabel="Voltar"
						onPress={() => router.back()}
						style={styles.headerIconButton}
					>
						<Feather name="arrow-left" size={21} color={styles.iconColor.color} />
					</TouchableOpacity>

					<View style={styles.headerTitleGroup}>
						<View style={styles.headerAvatar}>
							<Feather name="message-circle" size={18} color="#FFFFFF" />
						</View>
						<View>
							<Text style={styles.headerTitle}>Assistente financeiro</Text>
							<View style={styles.statusRow}>
								<View style={styles.statusDot} />
								<Text style={styles.headerSubtitle}>Respostas demonstrativas</Text>
							</View>
						</View>
					</View>

					<TouchableOpacity
						accessibilityLabel="Nova conversa"
						onPress={startNewConversation}
						style={styles.headerIconButton}
					>
						<Feather name="edit-3" size={18} color={styles.iconColor.color} />
					</TouchableOpacity>
				</View>

				<ScrollView
					ref={scrollViewRef}
					style={styles.conversationSurface}
					contentContainerStyle={styles.conversationContent}
					keyboardShouldPersistTaps="handled"
					showsVerticalScrollIndicator={false}
				>
					{messages.length === 0 ? (
						<View style={styles.welcomeContainer}>
							<View style={styles.welcomeIcon}>
								<Feather name="trending-up" size={27} color="#006BFF" />
							</View>
							<Text style={styles.welcomeTitle}>Vamos cuidar bem do seu dinheiro?</Text>
							<Text style={styles.welcomeDescription}>
								Tire dúvidas e encontre ideias práticas para sua organização financeira.
							</Text>

							<View style={styles.suggestions}>
								{suggestions.map((suggestion) => (
									<TouchableOpacity
										key={suggestion}
										onPress={() => sendMessage(suggestion)}
										style={styles.suggestionButton}
									>
										<Text style={styles.suggestionText}>{suggestion}</Text>
										<Feather name="arrow-up-right" size={16} color="#006BFF" />
									</TouchableOpacity>
								))}
							</View>
						</View>
					) : (
						<View style={styles.messageList}>
							{messages.map((message) => (
								<View
									key={message.id}
									style={[
										styles.messageRow,
										message.role === "user" && styles.userMessageRow,
									]}
								>
									{message.role === "assistant" && (
										<View style={styles.messageAvatar}>
											<Feather name="message-circle" size={14} color="#FFFFFF" />
										</View>
									)}
									<View
										style={[
											styles.messageBubble,
											message.role === "user"
												? styles.userMessageBubble
												: styles.assistantMessageBubble,
										]}
									>
										<Text
											style={
												message.role === "user"
													? styles.userMessageText
													: styles.assistantMessageText
											}
										>
											{message.text}
										</Text>
									</View>
								</View>
							))}

							{isResponding && (
								<View style={styles.messageRow}>
									<View style={styles.messageAvatar}>
										<Feather name="message-circle" size={14} color="#FFFFFF" />
									</View>
									<View style={[styles.messageBubble, styles.assistantMessageBubble]}>
										<Text style={styles.typingText}>Preparando uma resposta...</Text>
									</View>
								</View>
							)}
						</View>
					)}
				</ScrollView>

				<View style={styles.composerArea}>
					<View style={styles.disclaimerRow}>
						<Feather name="info" size={13} color={styles.mutedColor.color} />
						<Text style={styles.disclaimerText}>
							Conteúdo educativo. Não é consultoria financeira.
						</Text>
					</View>
					<View style={styles.composer}>
						<TextInput
							accessibilityLabel="Digite sua mensagem"
							editable={!isResponding}
							multiline
							onChangeText={setDraft}
							onSubmitEditing={() => sendMessage()}
							placeholder="Escreva sua dúvida..."
							placeholderTextColor={isDark ? "#8793A3" : "#929AA5"}
							returnKeyType="send"
							style={styles.input}
							value={draft}
						/>
						<TouchableOpacity
							accessibilityLabel="Enviar mensagem"
							accessibilityState={{ disabled: !draft.trim() || isResponding }}
							disabled={!draft.trim() || isResponding}
							onPress={() => sendMessage()}
							style={[
								styles.sendButton,
								(!draft.trim() || isResponding) && styles.sendButtonDisabled,
							]}
						>
							<Feather name="arrow-up" size={20} color="#FFFFFF" />
						</TouchableOpacity>
					</View>
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

function createStyles(isDark: boolean) {
	const background = isDark ? "#001B44" : "#006BFF";
	const surface = isDark ? "#0B1933" : "#F7F9FC";
	const card = isDark ? "#101E36" : "#FFFFFF";
	const text = isDark ? "#FFFFFF" : "#001B44";
	const muted = isDark ? "#AEBBD0" : "#6B7280";
	const headerMuted = isDark ? "#B8C7DD" : "#DCEAFF";
	const border = isDark ? "#243653" : "#DCE3ED";

	return StyleSheet.create({
		safeArea: { flex: 1, backgroundColor: background },
		keyboardView: { flex: 1 },
		header: {
			minHeight: 76,
			paddingHorizontal: 20,
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "space-between",
			backgroundColor: background,
		},
		headerIconButton: {
			width: 40,
			height: 40,
			alignItems: "center",
			justifyContent: "center",
			borderRadius: 20,
		},
		headerTitleGroup: {
			flex: 1,
			flexDirection: "row",
			alignItems: "center",
			gap: 11,
			marginLeft: 8,
		},
		headerAvatar: {
			width: 38,
			height: 38,
			borderRadius: 19,
			alignItems: "center",
			justifyContent: "center",
			backgroundColor: isDark ? "#2563EB" : "#0058D6",
		},
		headerTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "800" },
		statusRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 3 },
		statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#8FC5FF" },
		headerSubtitle: { color: headerMuted, fontSize: 11 },
		conversationSurface: {
			flex: 1,
			backgroundColor: surface,
			borderTopLeftRadius: 38,
			overflow: "hidden",
		},
		conversationContent: { flexGrow: 1, justifyContent: "center", padding: 20 },
		welcomeContainer: { alignItems: "center", paddingBottom: 14 },
		welcomeIcon: {
			width: 58,
			height: 58,
			borderRadius: 20,
			alignItems: "center",
			justifyContent: "center",
			backgroundColor: isDark ? "#162844" : "#E8F1FF",
			marginBottom: 18,
		},
		welcomeTitle: {
			maxWidth: 290,
			color: text,
			fontSize: 22,
			lineHeight: 29,
			fontWeight: "800",
			textAlign: "center",
		},
		welcomeDescription: {
			maxWidth: 300,
			color: muted,
			fontSize: 14,
			lineHeight: 21,
			textAlign: "center",
			marginTop: 9,
			marginBottom: 25,
		},
		suggestions: { width: "100%", gap: 9 },
		suggestionButton: {
			minHeight: 50,
			paddingHorizontal: 15,
			paddingVertical: 11,
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "space-between",
			gap: 10,
			borderWidth: 1,
			borderColor: border,
			borderRadius: 12,
			backgroundColor: card,
		},
		suggestionText: { flex: 1, color: text, fontSize: 13, fontWeight: "500" },
		messageList: { gap: 18, paddingVertical: 8 },
		messageRow: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
		userMessageRow: { justifyContent: "flex-end" },
		messageAvatar: {
			width: 27,
			height: 27,
			borderRadius: 14,
			alignItems: "center",
			justifyContent: "center",
			backgroundColor: isDark ? "#2563EB" : "#006BFF",
		},
		messageBubble: { maxWidth: "82%", paddingHorizontal: 14, paddingVertical: 11, borderRadius: 16 },
		assistantMessageBubble: {
			borderBottomLeftRadius: 5,
			backgroundColor: card,
			borderWidth: StyleSheet.hairlineWidth,
			borderColor: border,
		},
		userMessageBubble: { borderBottomRightRadius: 5, backgroundColor: "#006BFF" },
		assistantMessageText: { color: text, fontSize: 14, lineHeight: 21 },
		userMessageText: { color: "#FFFFFF", fontSize: 14, lineHeight: 21 },
		typingText: { color: muted, fontSize: 13 },
		composerArea: {
			paddingHorizontal: 16,
			paddingTop: 10,
			paddingBottom: Platform.OS === "android" ? 12 : 8,
			backgroundColor: surface,
			borderTopWidth: StyleSheet.hairlineWidth,
			borderTopColor: border,
		},
		disclaimerRow: {
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "center",
			gap: 6,
			marginBottom: 9,
		},
		disclaimerText: { color: muted, fontSize: 11 },
		composer: {
			minHeight: 50,
			maxHeight: 120,
			paddingLeft: 15,
			paddingRight: 6,
			paddingVertical: 5,
			flexDirection: "row",
			alignItems: "center",
			gap: 8,
			borderWidth: 1,
			borderColor: border,
			borderRadius: 25,
			backgroundColor: card,
		},
		input: { flex: 1, maxHeight: 105, color: text, fontSize: 14, paddingVertical: 8 },
		sendButton: {
			width: 38,
			height: 38,
			borderRadius: 19,
			alignItems: "center",
			justifyContent: "center",
			backgroundColor: isDark ? "#8FC5FF" : "#006BFF",
		},
		sendButtonDisabled: { backgroundColor: isDark ? "#29476F" : "#B6C8E0" },
		iconColor: { color: "#FFFFFF" },
		mutedColor: { color: muted },
	});
}
